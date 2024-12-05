import math
import logging
from random import choice, uniform

class PongGame:
    def __init__(self, limit_points=5):
        self.left_bar_pos = 50 
        self.right_bar_pos = 50
        self.ball_pos = {"x": 50, "y": 50} 
        self.ball_speed = {"x": choice([-0.3, 0.3]), "y": uniform(-0.2, 0.2)}  # Direction initiale
        self.left_score = 0
        self.right_score = 0
        self.limit_points = limit_points
        self.resetting_ball = False

    def move_bar(self, bar, direction):
        if bar == "left":
            print(f"Left bar moving from {self.left_bar_pos} to {self.left_bar_pos + direction}")
            self.left_bar_pos = max(7.5, min(92.5, self.left_bar_pos + direction))
        elif bar == "right":
            self.right_bar_pos = max(7.5, min(92.5, self.right_bar_pos + direction))
            print(f"Right bar moving from {self.right_bar_pos} to {self.right_bar_pos + direction}")

    def reset_ball(self):
        self.ball_pos = {"x": 50, "y": 50}
        self.ball_speed = {"x": choice([-0.3, 0.3]), "y": uniform(-0.2, 0.2)}
        self.resetting_ball = False

    def move_ball(self):
        if self.resetting_ball:
            return

        self.ball_pos["x"] += self.ball_speed["x"]
        self.ball_pos["y"] += self.ball_speed["y"]

        if self.ball_pos["y"] <= 0 or self.ball_pos["y"] >= 100:
            self.ball_speed["y"] *= -1

        if self.ball_pos["x"] <= 0:
            self.right_score += 1
            self.resetting_ball = True
            self.reset_ball()
        elif self.ball_pos["x"] >= 100:
            self.left_score += 1
            self.resetting_ball = True
            self.reset_ball()

    def check_collision(self, barre, barre_pos):
        if barre == "left" and self.ball_pos["x"] <= 5:
            return barre_pos - 7.5 <= self.ball_pos["y"] <= barre_pos + 7.5
        elif barre == "right" and self.ball_pos["x"] >= 95:
            return barre_pos - 7.5 <= self.ball_pos["y"] <= barre_pos + 7.5
        return False
    
    def handle_collision(self, barre):
        if barre == "left":
            self.ball_speed["x"] = abs(self.ball_speed["x"]) * 1.1
        elif barre == "right":
            self.ball_speed["x"] = -abs(self.ball_speed["x"]) * 1.1

        angle = self.calculate_angle(barre)
        self.ball_speed["y"] = math.sin(angle) * 1.1

    def calculate_angle(self, barre_pos):
        impact_point = (self.ball_pos["y"] - barre_pos + 7.5) / 15
        return (impact_point - 0.5) * (math.pi / 4)  # Max 45°

    def is_game_over(self):
        return self.left_score >= self.limit_points or self.right_score >= self.limit_points

    def get_winner(self):
        if self.left_score >= self.limit_points:
            return "left"
        elif self.right_score >= self.limit_points:
            return "right"
        return None