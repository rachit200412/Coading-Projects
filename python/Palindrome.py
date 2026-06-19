num = 121
original = num
reversed_num = 0

while num > 0:
    digit = num % 10  # Get last digit
    reversed_num = reversed_num * 10 + digit  # Build reversed number
    num //= 10  # Remove last digit

if original == reversed_num:
    print("Palindrome")

