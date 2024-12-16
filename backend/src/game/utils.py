def serialize_game_state(game):
    return {
        "left_bar_pos": game.left_bar_pos,
        "right_bar_pos": game.right_bar_pos,
        "ball_pos": game.ball_pos,
        "left_score": game.left_score,
        "right_score": game.right_score,
    }

def serialize_game_state2(game):
    return {
        "left_bar_pos": game.left_bar_pos,
        "right_bar_pos": game.right_bar_pos,
        "right_bar_height": game.right_bar_height,
        "left_bar_height": game.left_bar_height,
        "ball_pos": game.ball_pos,
        "left_score": game.left_score,
        "right_score": game.right_score,
    }