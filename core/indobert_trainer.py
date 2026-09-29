"""
IndoBERT Fine-Tuning Module for TNGC Aspect-Based Sentiment Analysis.
Architecture: indobenchmark/indobert-base-p1
Hardware target: NVIDIA GeForce RTX 3050 6GB Laptop GPU (CUDA).
"""

import os
import torch
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch.optim import AdamW
from transformers import get_linear_schedule_with_warmup
from sklearn.metrics import classification_report, f1_score, confusion_matrix

MODEL_NAME = "indobenchmark/indobert-base-p1"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

LABEL_MAPPING = {"negatif": 0, "netral": 1, "positif": 2}
INV_LABEL_MAPPING = {0: "negatif", 1: "netral", 2: "positif"}


class TNGCDataset(Dataset):
    def __init__(self, texts: list, labels: list, tokenizer, max_length: int = 128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )
        item = {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0)
        }
        if self.labels is not None:
            item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def compute_class_weights(labels: list) -> torch.Tensor:
    """Menghitung bobot kelas untuk menangani data imbalance secara terarah."""
    classes, counts = np.unique(labels, return_counts=True)
    total_samples = len(labels)
    weights = total_samples / (len(classes) * counts)
    weight_tensor = torch.zeros(len(LABEL_MAPPING), dtype=torch.float)
    for c, w in zip(classes, weights):
        weight_tensor[c] = float(w)
    return weight_tensor.to(DEVICE)


def train_indobert(
    train_texts: list,
    train_labels: list,
    val_texts: list,
    val_labels: list,
    epochs: int = 3,
    batch_size: int = 16,
    lr: float = 2e-5,
    max_length: int = 128
) -> Dict[str, Any]:
    """Fine-tuning IndoBERT dengan loss tertimbang (Weighted Cross-Entropy)."""
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=3)
    model.to(DEVICE)

    # Convert str labels to int
    y_train_int = [LABEL_MAPPING[l] for l in train_labels]
    y_val_int = [LABEL_MAPPING[l] for l in val_labels]

    train_dataset = TNGCDataset(train_texts, y_train_int, tokenizer, max_length=max_length)
    val_dataset = TNGCDataset(val_texts, y_val_int, tokenizer, max_length=max_length)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    class_weights = compute_class_weights(y_train_int)
    loss_fn = torch.nn.CrossEntropyLoss(weight=class_weights)

    optimizer = AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=int(total_steps * 0.1), num_training_steps=total_steps)

    history = {"train_loss": [], "val_macro_f1": []}
    best_f1 = 0.0
    best_model_state = None

    for epoch in range(epochs):
        model.train()
        total_train_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            loss = loss_fn(outputs.logits, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            total_train_loss += loss.item()

        avg_train_loss = total_train_loss / len(train_loader)
        history["train_loss"].append(avg_train_loss)

        # Evaluasi Validation
        model.eval()
        val_preds, val_targets = [], []
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(DEVICE)
                attention_mask = batch["attention_mask"].to(DEVICE)
                labels = batch["labels"].to(DEVICE)

                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()
                val_preds.extend(preds)
                val_targets.extend(labels.cpu().numpy())

        epoch_f1 = f1_score(val_targets, val_preds, average="macro", zero_division=0)
        history["val_macro_f1"].append(epoch_f1)

        if epoch_f1 > best_f1:
            best_f1 = epoch_f1
            best_model_state = model.state_dict().copy()

    # Load bobot terbaik
    if best_model_state is not None:
        model.load_state_dict(best_model_state)

    # Final Test Metrics
    val_preds_str = [INV_LABEL_MAPPING[p] for p in val_preds]
    val_targets_str = [INV_LABEL_MAPPING[t] for t in val_targets]
    classes = ["negatif", "netral", "positif"]
    cm = confusion_matrix(val_targets_str, val_preds_str, labels=classes)
    report = classification_report(val_targets_str, val_preds_str, output_dict=True, zero_division=0)

    return {
        "model": model,
        "tokenizer": tokenizer,
        "history": history,
        "best_macro_f1": best_f1,
        "classification_report": report,
        "confusion_matrix": cm,
        "classes": classes,
        "predictions": val_preds_str
    }
