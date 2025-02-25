import math
from random import choice, uniform

class PongGame:
    def __init__(self, limit_points=5):
        self.left_bar_pos = 50 
        self.right_bar_pos = 50
        self.ball_pos = {"x": 50, "y": 50} 
        self.ball_speed = {"x": choice([-1, 1]), "y": uniform(-0.8, 0.8)}
        self.left_score = 0
        self.right_score = 0
        self.limit_points = limit_points
        self.resetting_ball = False
        self.isAtive = False

    def move_bar(self, bar, direction):
        if bar == "left":
            self.left_bar_pos = max(7.5, min(92.5, self.left_bar_pos + direction))
        elif bar == "right":
            self.right_bar_pos = max(7.5, min(92.5, self.right_bar_pos + direction))

    def reset_ball(self):
        if self.is_game_over():
            return
        self.ball_pos = {"x": 50, "y": 50}
        self.ball_speed = {"x": choice([-1, 1]), "y": uniform(-0.8, 0.8)}
        self.resetting_ball = False

    def move_ball(self):
        if not self.isAtive or self.resetting_ball:
            return

        self.ball_pos["x"] += self.ball_speed["x"]
        self.ball_pos["y"] += self.ball_speed["y"]

        if self.ball_pos["y"] <= 0 or self.ball_pos["y"] >= 100:
            self.ball_speed["y"] *= -1

        if self.check_collision("left", self.left_bar_pos):
            self.handle_collision("left")
        elif self.check_collision("right", self.right_bar_pos):
            self.handle_collision("right")

        if self.ball_pos["x"] <= 0:
            self.right_score += 1
            self.resetting_ball = True
            self.reset_ball()
        elif self.ball_pos["x"] >= 100:
            self.left_score += 1
            self.resetting_ball = True
            self.reset_ball()

        if self.is_game_over():
            return

    def check_collision(self, barre, barre_pos):
        ball_radius = 1.5
        bar_width = 2
        bar_height = 15

        if barre == "left":
            if self.ball_pos["x"] <= bar_width + ball_radius:
                return barre_pos - (bar_height / 2) <= self.ball_pos["y"] <= barre_pos + (bar_height / 2)
        elif barre == "right":
            if self.ball_pos["x"] >= 100 - bar_width - ball_radius:
                return barre_pos - (bar_height / 2) <= self.ball_pos["y"] <= barre_pos + (bar_height / 2)
        return False
    
    def handle_collision(self, barre):
        if barre == "left":
            self.ball_speed["x"] = abs(self.ball_speed["x"])
        elif barre == "right":
            self.ball_speed["x"] = -abs(self.ball_speed["x"])

        barre_pos = self.left_bar_pos if barre == "left" else self.right_bar_pos
        impact_point = (self.ball_pos["y"] - barre_pos) / 15 
        impact_point = max(-1, min(1, impact_point))

        angle = impact_point * (math.pi / 4)
        self.ball_speed["y"] = math.sin(angle) * abs(self.ball_speed["x"])

        acceleration = 1.1
        self.ball_speed["x"] *= acceleration
        self.ball_speed["y"] *= acceleration

        limit_speed = 3
        self.ball_speed["x"] = max(-limit_speed, min(limit_speed, self.ball_speed["x"]))
        self.ball_speed["y"] = max(-limit_speed, min(limit_speed, self.ball_speed["y"]))


    def calculate_angle(self, barre_pos):
        impact_point = (self.ball_pos["y"] - barre_pos + 7.5) / 15
        return (impact_point - 0.5) * (math.pi / 4)

    def is_game_over(self):
        if self.left_score >= self.limit_points or self.right_score >= self.limit_points:
            self.isAtive = False
            return True
        return False

    def get_winner(self):
        if self.left_score >= self.limit_points:
            return "left"
        elif self.right_score >= self.limit_points:
            return "right"
        return None


class PongGameCustom:
    def __init__(self, limit_points=5):
        self.left_bar_pos = 50 
        self.right_bar_pos = 50
        self.ball_pos = {"x": 50, "y": 50} 
        self.ball_speed = {"x": choice([-1, 1]), "y": uniform(-0.8, 0.8)}
        self.left_bar_height = 15  
        self.right_bar_height = 15
        self.left_score = 0
        self.right_score = 0
        self.limit_points = limit_points
        self.resetting_ball = False
        self.isAtive = False

        self.left_bar_growing = False
        self.right_bar_growing = False
        self.growth_amount = 5
        self.max_bar_height = 60

    def move_bar(self, bar, direction):
        if bar == "left":
            self.left_bar_pos = max(7.5, min(92.5, self.left_bar_pos + direction))
        elif bar == "right":
            self.right_bar_pos = max(7.5, min(92.5, self.right_bar_pos + direction))

    def reset_ball(self):
        if self.is_game_over():
            return
        self.ball_pos = {"x": 50, "y": 50}
        self.ball_speed = {"x": choice([-1, 1]), "y": uniform(-0.8, 0.8)}
        self.resetting_ball = False
        self.left_bar_growing = False
        self.right_bar_growing = False
        self.left_bar_height = 15
        self.right_bar_height = 15

    def move_ball(self):
        if not self.isAtive or self.resetting_ball:
            return

        self.ball_pos["x"] += self.ball_speed["x"]
        self.ball_pos["y"] += self.ball_speed["y"]

        if self.ball_pos["y"] <= 0 or self.ball_pos["y"] >= 100:
            self.ball_speed["y"] *= -1

        if self.check_collision("left", self.left_bar_pos):
            self.handle_collision("left")
            if self.left_bar_height < self.max_bar_height and not self.left_bar_growing:
                self.left_bar_height += self.growth_amount 
                self.left_bar_growing = True
        elif self.check_collision("right", self.right_bar_pos):
            self.handle_collision("right")
            if self.right_bar_height < self.max_bar_height and not self.right_bar_growing:
                self.right_bar_height += self.growth_amount
                self.right_bar_growing = True

        self.right_bar_growing = False
        self.left_bar_growing = False

        if self.ball_pos["x"] <= 0:
            self.right_score += 1
            self.resetting_ball = True
            self.reset_ball()
        elif self.ball_pos["x"] >= 100:
            self.left_score += 1
            self.resetting_ball = True
            self.reset_ball()

        if self.is_game_over():
            return

    def check_collision(self, barre, barre_pos):
        ball_radius = 1.5
        bar_width = 2
        if barre == "left":
            bar_height = self.left_bar_height
        elif barre == "right":
            bar_height = self.right_bar_height

        if barre == "left":
            if self.ball_pos["x"] <= bar_width + ball_radius:
                return barre_pos - (bar_height / 2) <= self.ball_pos["y"] <= barre_pos + (bar_height / 2)
        elif barre == "right":
            if self.ball_pos["x"] >= 100 - bar_width - ball_radius:
                return barre_pos - (bar_height / 2) <= self.ball_pos["y"] <= barre_pos + (bar_height / 2)
        return False
    
    def handle_collision(self, barre):
        if barre == "left":
            self.ball_speed["x"] = abs(self.ball_speed["x"])
        elif barre == "right":
            self.ball_speed["x"] = -abs(self.ball_speed["x"])

        barre_pos = self.left_bar_pos if barre == "left" else self.right_bar_pos
        impact_point = (self.ball_pos["y"] - barre_pos) / 15 
        impact_point = max(-1, min(1, impact_point))

        angle = impact_point * (math.pi / 4)
        self.ball_speed["y"] = math.sin(angle) * abs(self.ball_speed["x"])

        acceleration = 1.1
        self.ball_speed["x"] *= acceleration
        self.ball_speed["y"] *= acceleration

        limit_speed = 3
        self.ball_speed["x"] = max(-limit_speed, min(limit_speed, self.ball_speed["x"]))
        self.ball_speed["y"] = max(-limit_speed, min(limit_speed, self.ball_speed["y"]))


    def calculate_angle(self, barre_pos):
        impact_point = (self.ball_pos["y"] - barre_pos + 7.5) / 15
        return (impact_point - 0.5) * (math.pi / 4)

    def is_game_over(self):
        if self.left_score >= self.limit_points or self.right_score >= self.limit_points:
            self.isAtive = False
            return True
        return False

    def get_winner(self):
        if self.left_score >= self.limit_points:
            return "left"
        elif self.right_score >= self.limit_points:
            return "right"
        return None
