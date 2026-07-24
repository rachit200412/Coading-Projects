######### Taking Values From User #############

# a = int(input("Enter a number: "))  
# b = float(input("Enter a number: "))  
# c = str(input("Enter a string: "))

# print("The integer is:", a)
# print("The float is:", b)  
# print("The string is:", c)

#########  Using f for print ##########

# a = 12 
# a = a 
# print(a//2) 
# print(f"the value of a is {a} after dividing with  A") 

################  Bool Example ###############

# is_active=True
# has_error = False

# if is_active:
#      print("work")
# else:
#     print("not working")

###########  Conditional Statement ###############

# a=int(input("Enter a number: "))
# b = int(input("Enter a number: "))
# c = int(input("Enter a number: "))
 
# if a > b :
#     print("a is the greatest number")
# elif b>c :
#     print (f"cow can fly {a} times ")
# else : 
#     print( f"cow is gone Away far {c}")

               # Gender Greeting #

# a = "Madam" 
# b = "sir" 
# gender = input("enter the gender : ").strip().lower()

# if gender == "male" :
#      print(f"Good Morning {b} ")
# elif gender == "female" :
#      print(f"Good morning  {a}")
# else :
#      print("Enter Gender Only ")

####### EVEN ODD #########

a = int(input("enter a Number to check its odd or even : "))
 

if a == 0:
    print(f"Really a {a} just like your future money")
elif a % 2==0:
    print(f"{a} is an even number ")
elif a < 0 :
    print(f" Reallyy a {a} : enter positive number ")
else : 
    print(f"{a} is an odd number ")








a = int(input("Enter a Number to check its odd or even: "))

if a == 0:
    print(f"Really an {a} just like your future earnings")
elif a < 0:
    print(f"Really a negative {a}")
elif a % 2 == 0:
    print(f"{a} is an even number")
else:
    print(f"{a} is an odd number")