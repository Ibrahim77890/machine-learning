from flask import Flask, request, jsonify
import mlflow.pytorch
import torch
import numpy as np
import pickle

# Load mappings (ensure these files are saved during training)
with open("user_id_map.pkl", "rb") as f:
    user_id_map = pickle.load(f)
with open("item_id_map.pkl", "rb") as f:
    item_id_map = pickle.load(f)
rev_item_id_map = {v: k for k, v in item_id_map.items()}

# Load the trained model from MLflow
mlflow.set_tracking_uri("http://127.0.0.1:8080")
model = mlflow.pytorch.load_model("models:/ColdStartRecommendationModel@best")

# Flask app initialization
app = Flask(__name__)

# Wrapper class for the recommendation model
class RecommendationModel:
    def __init__(self, model, n_items):
        self.model = model
        self.n_items = n_items

    def get_recommendations(self, user_idx, n_recommendations=10):
        # Generate predictions for all items
        user_tensor = torch.LongTensor([user_idx] * self.n_items)
        item_tensor = torch.LongTensor(range(self.n_items))

        with torch.no_grad():
            predictions = self.model(user_tensor, item_tensor)

        # Get top N recommendations
        top_indices = torch.topk(predictions, n_recommendations).indices.numpy()
        top_scores = predictions[top_indices].numpy()

        return list(zip(top_indices, top_scores))

# Initialize the recommendation model
wrapped_model = RecommendationModel(model, n_items=len(item_id_map))

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    user_id = data.get("user_id")

    # Check if the user exists in the mapping
    if user_id not in user_id_map:
        return jsonify({"error": "Unknown user"}), 400

    user_idx = user_id_map[user_id]
    recommendations = wrapped_model.get_recommendations(user_idx)

    # Format the results to return item_idx directly with proper type conversion
    results = [
        {"item_idx": int(item_idx), "score": float(score)}  # Convert to Python int and float
        for item_idx, score in recommendations
    ]

    return jsonify(results)

if __name__ == "__main__":
    app.run(port=5001)