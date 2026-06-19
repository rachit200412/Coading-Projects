import pygame
import math
import random
import sys

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 1000, 700
FPS = 60
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 50, 50)
GREEN = (50, 255, 50)
BLUE = (50, 50, 255)
YELLOW = (255, 255, 0)
PURPLE = (255, 0, 255)

# Game setup
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("🚀 SKY SHOTTER - Space Wars!")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 36)
big_font = pygame.font.Font(None, 72)

class Player:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT - 80
        self.width = 50
        self.height = 40
        self.speed = 5
        self.health = 3
    
    def move(self, keys):
        if keys[pygame.K_LEFT] and self.x > 0:
            self.x -= self.speed
        if keys[pygame.K_RIGHT] and self.x < WIDTH - self.width:
            self.x += self.speed
        if keys[pygame.K_UP] and self.y > 0:
            self.y -= self.speed
        if keys[pygame.K_DOWN] and self.y < HEIGHT - self.height:
            self.y += self.speed
    
    def draw(self, screen):
        # Ship body
        pygame.draw.polygon(screen, BLUE, [
            (self.x + self.width//2, self.y),
            (self.x, self.y + self.height),
            (self.x + self.width, self.y + self.height)
        ])
        # Wings
        pygame.draw.rect(screen, WHITE, (self.x + 5, self.y + 20, 10, 15))
        pygame.draw.rect(screen, WHITE, (self.x + self.width - 15, self.y + 20, 10, 15))
        # Health bars
        for i in range(self.health):
            pygame.draw.rect(screen, RED, (10 + i * 35, 10, 30, 8))
    
    def shoot(self):
        return Bullet(self.x + self.width//2, self.y)

class Bullet:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.speed = 8
        self.width = 4
        self.height = 12
    
    def move(self):
        self.y -= self.speed
    
    def draw(self, screen):
        pygame.draw.rect(screen, YELLOW, (self.x, self.y, self.width, self.height))
    
    def off_screen(self):
        return self.y < 0

class Enemy:
    def __init__(self):
        self.x = random.randint(0, WIDTH - 40)
        self.y = -50
        self.width = 40
        self.height = 30
        self.speed = random.uniform(2, 4)
    
    def move(self):
        self.y += self.speed
    
    def draw(self, screen):
        # Enemy ship
        pygame.draw.polygon(screen, RED, [
            (self.x + self.width//2, self.y),
            (self.x, self.y + self.height),
            (self.x + self.width, self.y + self.height)
        ])
        pygame.draw.rect(screen, PURPLE, (self.x + 10, self.y + 10, 20, 8))
    
    def off_screen(self):
        return self.y > HEIGHT

class Particle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = random.uniform(-3, 3)
        self.vy = random.uniform(-3, 3)
        self.life = 30
        self.max_life = 30
    
    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.life -= 1
    
    def draw(self, screen):
        alpha = self.life / self.max_life
        size = int(4 * alpha)
        color = (int(255 * alpha), int(100 * alpha), 0)
        if size > 0:
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), size)

# Game variables
player = Player()
bullets = []
enemies = []
particles = []
score = 0
level = 1
enemy_spawn_timer = 0

def collide(rect1, rect2):
    return (rect1[0] < rect2[0] + rect2[2] and
            rect1[0] + rect1[2] > rect2[0] and
            rect1[1] < rect2[1] + rect2[3] and
            rect1[1] + rect1[3] > rect2[1])

# Main game loop
running = True
game_over = False
while running:
    clock.tick(FPS)
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and not game_over:
                bullets.append(player.shoot())
            if event.key == pygame.K_r and game_over:
                # Restart
                player = Player()
                bullets = []
                enemies = []
                particles = []
                score = 0
                level = 1
                game_over = False
    
    if not game_over:
        keys = pygame.key.get_pressed()
        player.move(keys)
        
        # Shooting
        if pygame.key.get_pressed()[pygame.K_SPACE]:
            pass  # Auto handled by event
        
        # Update bullets
        for bullet in bullets[:]:
            bullet.move()
            if bullet.off_screen():
                bullets.remove(bullet)
        
        # Spawn enemies
        enemy_spawn_timer += 1
        if enemy_spawn_timer > max(30 - level * 2, 10):
            enemies.append(Enemy())
            enemy_spawn_timer = 0
        
        # Update enemies
        for enemy in enemies[:]:
            enemy.move()
            if enemy.off_screen():
                enemies.remove(enemy)
            
            # Collision with player
            player_rect = (player.x, player.y, player.width, player.height)
            enemy_rect = (enemy.x, enemy.y, enemy.width, enemy.height)
            if collide(player_rect, enemy_rect):
                player.health -= 1
                enemies.remove(enemy)
                for _ in range(20):
                    particles.append(Particle(enemy.x + enemy.width//2, enemy.y + enemy.height//2))
                if player.health <= 0:
                    game_over = True
        
        # Bullet-enemy collisions
        for bullet in bullets[:]:
            bullet_rect = (bullet.x, bullet.y, bullet.width, bullet.height)
            for enemy in enemies[:]:
                enemy_rect = (enemy.x, enemy.y, enemy.width, enemy.height)
                if collide(bullet_rect, enemy_rect):
                    score += 10 * level
                    bullets.remove(bullet)
                    enemies.remove(enemy)
                    for _ in range(15):
                        particles.append(Particle(enemy.x + enemy.width//2, enemy.y + enemy.height//2))
                    break
        
        # Level up
        if score > level * 500:
            level += 1
        
        # Update particles
        for particle in particles[:]:
            particle.update()
            if particle.life <= 0:
                particles.remove(particle)
    
    # Draw everything
    screen.fill((10, 10, 30))  # Dark space
    
    # Stars background
    for _ in range(100):
        x = (_ * 123) % WIDTH
        y = (_ * 456) % HEIGHT
        size = (_ % 3) + 1
        pygame.draw.circle(screen, WHITE, (x, y), size)
    
    if not game_over:
        player.draw(screen)
        for bullet in bullets:
            bullet.draw(screen)
        for enemy in enemies:
            enemy.draw(screen)
        
        # UI
        score_text = font.render(f"Score: {score}", True, WHITE)
        level_text = font.render(f"Level: {level}", True, GREEN)
        screen.blit(score_text, (10, HEIGHT - 40))
        screen.blit(level_text, (WIDTH - 150, HEIGHT - 40))
        controls = pygame.font.Font(None, 24).render("SPACE=Shoot | ARROWS=Move | R=Restart", True, WHITE)
        screen.blit(controls, (10, HEIGHT - 20))
    else:
        # Game Over screen
        overlay = pygame.Surface((WIDTH, HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        screen.blit(overlay, (0, 0))
        
        game_over_text = big_font.render("GAME OVER", True, RED)
        final_score = font.render(f"Final Score: {score}", True, WHITE)
        restart_text = font.render("Press R to Restart", True, YELLOW)
        
        screen.blit(game_over_text, (WIDTH//2 - game_over_text.get_width()//2, HEIGHT//2 - 100))
        screen.blit(final_score, (WIDTH//2 - final_score.get_width()//2, HEIGHT//2 - 30))
        screen.blit(restart_text, (WIDTH//2 - restart_text.get_width()//2, HEIGHT//2 + 30))
    
    for particle in particles:
        particle.draw(screen)
    
    pygame.display.flip()

pygame.quit()
sys.exit()