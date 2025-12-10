#!/usr/bin/env python3
"""
Terminal Snake Game
A simple snake game that runs in the terminal using the curses library.
"""

import curses
import random
import time

def main(stdscr):
    # Setup terminal
    curses.curs_set(0)  # Hide cursor
    stdscr.timeout(100)  # Set input timeout for controlling game speed
    stdscr.clear()
    
    # Get terminal dimensions
    sh, sw = stdscr.getmaxyx()
    
    # Create game window with border
    win = curses.newwin(sh-2, sw-2, 1, 1)
    win.keypad(1)  # Enable special keys
    win.timeout(100)  # Set input timeout
    
    # Initialize colors
    curses.start_color()
    curses.init_pair(1, curses.COLOR_GREEN, curses.COLOR_BLACK)  # Snake
    curses.init_pair(2, curses.COLOR_RED, curses.COLOR_BLACK)    # Food
    curses.init_pair(3, curses.COLOR_YELLOW, curses.COLOR_BLACK) # Score
    
    # Initial snake position (middle of the screen)
    snake_y = sh // 2
    snake_x = sw // 2
    
    # Initial snake body (3 segments)
    snake = [
        [snake_y, snake_x],
        [snake_y, snake_x-1],
        [snake_y, snake_x-2]
    ]
    
    # Initial food position
    food = [sh//2, sw//2 + 5]
    win.addch(food[0], food[1], 'O', curses.color_pair(2))
    
    # Initial direction (right)
    key = curses.KEY_RIGHT
    
    # Initial score
    score = 0
    
    # Display border and score
    stdscr.box()
    stdscr.addstr(0, 2, " SNAKE GAME ", curses.A_BOLD)
    stdscr.addstr(0, sw - 15, f" Score: {score} ", curses.color_pair(3) | curses.A_BOLD)
    stdscr.refresh()
    
    # Game loop
    while True:
        # Display score in the border
        stdscr.addstr(0, sw - 15, f" Score: {score} ", curses.color_pair(3) | curses.A_BOLD)
        stdscr.refresh()
        
        # Get next key press (non-blocking)
        next_key = win.getch()
        
        # If key pressed, update direction
        if next_key != -1:
            key = next_key
        
        # Calculate new head position based on current direction
        new_head = [snake[0][0], snake[0][1]]
        
        # Update head position based on direction
        if key == curses.KEY_DOWN:
            new_head[0] += 1
        elif key == curses.KEY_UP:
            new_head[0] -= 1
        elif key == curses.KEY_LEFT:
            new_head[1] -= 1
        elif key == curses.KEY_RIGHT:
            new_head[1] += 1
        
        # Add new head to snake
        snake.insert(0, new_head)
        
        # Check if game over (hit wall or self)
        if (
            new_head[0] <= 0 or 
            new_head[0] >= sh-2 or 
            new_head[1] <= 0 or 
            new_head[1] >= sw-2 or 
            new_head in snake[1:]
        ):
            game_over(stdscr, sh, sw, score)
            break
        
        # Check if snake ate food
        if snake[0] == food:
            # Increase score
            score += 10
            
            # Generate new food
            while True:
                food = [
                    random.randint(1, sh-3),
                    random.randint(1, sw-3)
                ]
                if food not in snake:
                    break
            
            # Display new food
            win.addch(food[0], food[1], 'O', curses.color_pair(2))
        else:
            # Remove tail if no food eaten
            tail = snake.pop()
            win.addch(tail[0], tail[1], ' ')
        
        # Draw snake head
        win.addch(snake[0][0], snake[0][1], 'O', curses.color_pair(1))

def game_over(stdscr, sh, sw, score):
    """Display game over screen with score"""
    stdscr.clear()
    message = "GAME OVER!"
    score_msg = f"Your score: {score}"
    restart_msg = "Press any key to exit."
    
    # Display game over message
    stdscr.addstr(sh//2-2, (sw-len(message))//2, message, curses.A_BOLD)
    stdscr.addstr(sh//2, (sw-len(score_msg))//2, score_msg)
    stdscr.addstr(sh//2+2, (sw-len(restart_msg))//2, restart_msg)
    stdscr.refresh()
    
    # Wait for key press
    stdscr.getch()

if __name__ == "__main__":
    # Wrap the main function with curses.wrapper to handle initialization and cleanup
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        print("Game terminated by user.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        print("Thanks for playing Snake!")

