import pygame
import math
import random
import sys

pygame.init()

WIDTH, HEIGHT = 1200, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("💖 FAST Rachit's Love 💖")

BLACK = (0, 0, 0)
RED = (255, 40, 40)
PINK = (255, 120, 180)
GOLD = (255, 220, 80)
WHITE = (255, 255, 255)
LIGHT_BLUE = (100, 150, 255)
DARK_BLUE = (40, 60, 120)

pygame.font.init()
title_font = pygame.font.SysFont("Arial", 50, bold=True)
poem_font = pygame.font.SysFont("Arial", 36)
rachit_font = pygame.font.SysFont("Arial", 28)

# FASTER HEART - More points, smoother
cx, cy = 600, 380
points = []
for i in range(1500):  # MORE POINTS = SMOOTHER
    t = i * 0.00419  # TIGHTER SPACING
    x = 16 * math.sin(t)**3
    y = 13 * math.cos(t) - 5*math.cos(2*t) - 2*math.cos(3*t) - math.cos(4*t)
    points.append((int(cx + x*14), int(cy - y*14)))  # BIGGER HEART

particles = []
frame = 0
draw_idx = 0
clock = pygame.time.Clock()

poem_lines = [
    "Shìjiè hěn dà, dàn zài wǒ xīnlǐ,",
    "nǐ de kuàilè zuì zhòngyào。",
    "Duìbùqǐ, shì wǒ tài bèn le。"
]

def safe_color(r, g, b):
    return (min(max(int(r), 0), 255), min(max(int(g), 0), 255), min(max(int(b), 0), 255))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    screen.fill(BLACK)
    
    # FASTER Stars
    for i in range(80):  # MORE STARS
        x = (i*150 + math.sin(frame*0.08)*40) % WIDTH  # FASTER TWINKLE
        y = (i*200 + math.cos(frame*0.06)*25) % 300
        twinkle = 0.5 + 0.5 * math.sin(frame*0.5 + i)  # FASTER
        star_r = 150 + 100 * twinkle
        star_g = 200 + 55 * twinkle
        star_b = 255
        star_color = safe_color(star_r, star_g, star_b)
        size = max(1, int(2.5 + twinkle * 1.5))
        pygame.draw.circle(screen, star_color, (int(x), int(y)), size)
    
    # ULTRA FAST HEART DRAWING ⚡
    pulse = 1 + 0.3 * math.sin(frame * 0.4)  # FASTER PULSE
    if draw_idx < 1500:
        for i in range(int(draw_idx)):
            prog = i / 1500
            x, y = points[i]
            glow_size = int(15 * prog * pulse)  # BIGGER GLOW
            heart_size = int(8 * prog * pulse)  # BIGGER HEART
            
            glow_r = 220 * prog
            glow_g = 25 * prog
            glow_b = 25 * prog
            glow_color = safe_color(glow_r, glow_g, glow_b)
            pygame.draw.circle(screen, glow_color, (x, y), glow_size)
            
            heart_r = 270 * prog
            heart_g = 50 * prog
            heart_b = 50 * prog
            heart_color = safe_color(heart_r, heart_g, heart_b)
            pygame.draw.circle(screen, heart_color, (x, y), heart_size)
        
        # ⚡ 4x FASTER DRAWING SPEED ⚡
        draw_idx += 50  # WAS 12 → NOW 50!
        
        # MORE particles during drawing
        if random.random() < 0.8:
            px, py = points[int(draw_idx * 0.3) % 1500]
            particles.append([px, py, random.uniform(-4,4), random.uniform(-6,-1), 70])
    else:
        # FAST PULSING
        for i, (x, y) in enumerate(points):
            size = int(8 + 5*math.sin(frame*0.8 + i*0.015) * pulse)  # FASTER BEAT
            glow_size = size + 12
            glow_color = safe_color(160, 25, 25)
            heart_color = RED
            pygame.draw.circle(screen, glow_color, (x, y), glow_size)
            pygame.draw.circle(screen, heart_color, (x, y), size)
        
        # CONTINUOUS particle shower
        if random.random() < 1.2:  # MORE FREQUENT
            px, py = random.choice(points)
            particles.append([px, py, random.uniform(-4,4), random.uniform(-6,-1), 70])
    
    # FASTER particles
    for p in particles[:]:
        p[0] += p[2] * 1.2  # FASTER HORIZONTAL
        p[1] += p[3] * 1.1  # FASTER VERTICAL
        p[3] += 0.2         # FASTER GRAVITY
        p[4] -= 1.5         # FASTER FADE
        if p[4] > 0:
            alpha = p[4] / 70
            size = int(6 * alpha)
            if size > 0:
                r = 255 * alpha
                g = 140 * alpha
                b = 190 * alpha
                particle_color = safe_color(r, g, b)
                pygame.draw.circle(screen, particle_color, (int(p[0]), int(p[1])), size)
        else:
            particles.remove(p)
    
    # TEXT - EARLY APPEARANCE
    if frame > 50:  # EARLIER TITLE
        title = title_font.render("💙 Sincere Apology 💙", True, GOLD)
        title_shadow = title_font.render("💙 Sincere Apology 💙", True, LIGHT_BLUE)
        screen.blit(title_shadow, (WIDTH//2 - title.get_width()//2 + 2, 30))
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 28))
    
    if frame > 120:  # EARLIER POEM
        y_pos = HEIGHT//2 - 80
        for i, line in enumerate(poem_lines):
            shadow = poem_font.render(line, True, DARK_BLUE)
            main_text = poem_font.render(line, True, PINK)
            tw = main_text.get_width()
            screen.blit(shadow, (WIDTH//2 - tw//2 + 2, y_pos))
            screen.blit(main_text, (WIDTH//2 - tw//2, y_pos - 2))
            y_pos += 55
    
    if frame > 300:  # EARLIER ENGLISH
        eng_title = rachit_font.render("English:", True, LIGHT_BLUE)
        eng_line1 = rachit_font.render("The world is big, but in my heart,", True, WHITE)
        eng_line2 = rachit_font.render("your happiness matters most.", True, WHITE)
        eng_line3 = rachit_font.render("I'm sorry... I was foolish.", True, PINK)
        
        screen.blit(eng_title, (WIDTH//2 - eng_title.get_width()//2, HEIGHT//2 + 50))
        screen.blit(eng_line1, (WIDTH//2 - eng_line1.get_width()//2, HEIGHT//2 + 80))
        screen.blit(eng_line2, (WIDTH//2 - eng_line2.get_width()//2, HEIGHT//2 + 110))
        screen.blit(eng_line3, (WIDTH//2 - eng_line3.get_width()//2, HEIGHT//2 + 140))
    
    if frame > 500:
        forgive = rachit_font.render ("forgive me 💙", True, PINK)
        promise = rachit_font.render("", True, GOLD)
        from_rachit = rachit_font.render("~ Rachit 💖", True, WHITE)
        
        screen.blit(forgive, (WIDTH//2 - forgive.get_width()//2, HEIGHT - 160))
        screen.blit(promise, (WIDTH//2 - promise.get_width()//2, HEIGHT - 120))
        screen.blit(from_rachit, (WIDTH//2 - from_rachit.get_width()//2, HEIGHT - 80))
    
    pygame.display.flip()
    clock.tick(75)  # FASTER 75 FPS!
    frame += 1

pygame.quit()
sys.exit()