import random 
print("Welcome to the Number Guessing Game!")
print("I'm thinking of a number between 1 and 100...")
number = random.randint(100, 1000)
guess = None
attempts = 0

while guess != number:
    try:
        guess = int(input("Enter your guess: "))
        attempts += 1

        if guess < number:
            print("Too low! Try again.")
        elif guess > number:
            print("Too high! Try again.")
        else:
            print(f"🎉 Correct! You guessed it in {attempts} tries.")
    except ValueError:
        print("Please enter a valid number.")
 