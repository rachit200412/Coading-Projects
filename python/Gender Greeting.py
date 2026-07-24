a = "Madam" 
b = "sir" 
gender = input("enter the gender : ").strip().lower()

if gender == "male" :
     print(f"Good Morning {b} ")
elif gender == "female" :
     print(f"Good morning  {a}")
else :
     print("Enter Gender Only ")
