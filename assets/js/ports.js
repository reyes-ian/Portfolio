/*
 * Browser ports of my practice programs. Same prompts, messages and logic as the original
 * C++ / Java source shown next to them. Only difference: typing something that isn't a number
 * asks again instead of breaking the program.
 */
window.PORTS = {
  bmi: async ({ print, println, num, g }) => {
    println("===========BMI Calculator===========");
    print("Enter your height(M):"); const height = await num();
    print("Enter your weight(Kg):"); const weight = await num();
    const result = weight / Math.pow(height, 2);
    println("FORMULA"); println("Weight/Height^2");
    println("SOLUTION"); println(`${g(weight)}/${g(height)}^2`);
    println("BMI"); println("RESULT:" + g(result));
    if (result < 18.4) print("Under weight (Kumain Ka)");
    else if (result >= 18.5 && result <= 24.9) print("Very Nice");
    else if (result >= 25.0 && result <= 39.9) print("Overweight (Tamang Exercise Lang)");
    else if (result > 40) print("Obese (Papayat kana)");
    println();
  },

  weight: async ({ print, println, num, word, g }) => {
    println("~~~~~~~~~~~~~~~~~~~~~~~~~Weight Converter~~~~~~~~~~~~~~~~~~~~~~~~~");
    print("Enter Your Weight(ex.65Kg): ");
    let weight = await num(); const unit = await word();
    println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    const is = (v, ...opts) => opts.includes(v);
    if (is(unit, "Kg", "kg")) {
      print("Enter Unit You Want To Convert To(g=grams|lb=pounds): ");
      const c = await word();
      if (is(c, "G", "g")) { weight = weight * 1000; print("The converted Weight is: " + g(weight) + "g"); }
      else if (is(c, "lb", "Lb")) { weight = weight * 2.205; print("The converted Weight is: " + g(weight) + "lb"); }
    } else if (is(unit, "G", "g")) {
      print("Enter Unit You Want To Convert To(kg=kilograms|lb=pounds): ");
      const c = await word();
      if (is(c, "Kg", "kg")) { weight = weight / 1000; print("The converted Weight is: " + g(weight) + "kg"); }
      else if (is(c, "lb", "Lb")) { weight = weight / 453.6; print("The converted Weight is: " + g(weight) + "lb"); }
    } else if (is(unit, "Lb", "lb")) {
      print("Enter Unit You Want To Convert To(g=grams|kg=kilograms): ");
      const c = await word();
      if (is(c, "G", "g")) { weight = weight * 453.6; print("The converted Weight is: " + g(weight) + "g"); }
      else if (is(c, "Kg", "kg")) { weight = weight / 2.205; print("The converted Weight is: " + g(weight) + "kg"); }
    } else {
      print("Invalid Response");
    }
    println();
  },

  height: async ({ print, println, num, word, g }) => {
    println("~~~~~~~~~~~~~~~~~~~~~~~~~Height Calculator~~~~~~~~~~~~~~~~~~~~~~~~~");
    print("Enter Height Unit(cm,m,inch,ft):"); let unit = await word();
    print("Enter Height:"); let h = await num();
    println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    const is = (v, ...opts) => opts.includes(v);
    if (is(unit, "cm", "Cm")) {
      print("What unit do you want to convert cm to (m,inch,ft)?:"); unit = await word();
      if (is(unit, "in", "inch")) { h = h * 0.3937; print("Your Height in Inches:" + g(h)); }
      else if (is(unit, "m", "M")) { h = h * 0.01; print("Your Height in Meter:" + g(h)); }
      else if (is(unit, "ft", "Ft")) { h = h * 0.0328; print("Your Height in Ft:" + g(h)); }
    } else if (is(unit, "m", "M")) {
      print("What unit do you want to convert m to (cm,inch,ft)?:"); unit = await word();
      if (is(unit, "in", "inch")) { h = h * 39.3701; print("Your Height in Inches:" + g(h)); }
      else if (is(unit, "cm", "Cm")) { h = h * 100; print("Your Height in Meter:" + g(h)); }
      else if (is(unit, "ft", "Ft")) { h = h * 3.281; print("Your Height in Ft:" + g(h)); }
    } else if (is(unit, "in", "inch")) {
      print("What unit do you want to convert inch to (cm,m,ft)?:"); unit = await word();
      if (is(unit, "cm", "Cm")) { h = h * 2.54; print("Your Height in Cm" + g(h)); }
      else if (is(unit, "m", "M")) { h = h / 39.37; print("Your Height in Meter:" + g(h)); }
      else if (is(unit, "ft", "Ft")) { h = h / 12; print("Your Height in Ft:" + g(h)); }
    } else if (is(unit, "Ft", "ft")) {
      print("What unit do you want to convert inch to (cm,m,ft)?:"); unit = await word();
      if (is(unit, "cm", "Cm")) { h = h * 30.48; print("Your Height in Cm" + g(h)); }
      else if (is(unit, "m", "M")) { h = h * 304.8; print("Your Height in Meter:" + g(h)); }
      else if (is(unit, "in", "inch")) { h = h * 12; print("Your Height in Ft:" + g(h)); }
    } else {
      println("Invalid Response");
    }
    println();
  },

  compare: async ({ print, println, num, word, g }) => {
    println("~~~~~~~~~~~~~~~HEIGHT COMPARISON~~~~~~~~~~~~~~~");
    println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    print("Enter First Person Name(FirstName Or LastName): "); const fp = await word();
    print("Enter Height In Cm(178cm): "); const fh = await num(); let unit = await word();
    println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    print("Enter Second Person Name(FirstName Or LastName): "); const sp = await word();
    print("Enter Height In Cm(178cm): "); const sh = await num(); unit = await word();
    println("~~~~~~~~~~~~~~~~~Person 1 Info~~~~~~~~~~~~~~~~~");
    println("Name: " + fp); println("Height In Cm: " + g(fh) + " " + unit);
    println("~~~~~~~~~~~~~~~~~Person 2 Info~~~~~~~~~~~~~~~~~");
    println("Name: " + sp); println("Height In Cm: " + g(sh) + " " + unit);
    println("~~~~~~~~~~~~~~~Height Difference~~~~~~~~~~~~~~~");
    if (fh > sh) {
      const d = fh - sh;
      println(`The Height Difference Between ${fp} and ${sp} is: ${g(d)}${unit}`);
      print(`Therefore ${fp} is taller than ${sp} by ${g(d)}${unit}`);
    }
    if (fh < sh) {
      const d = sh - fh;
      println(`The Height Difference Between ${fp} and ${sp} is: ${g(d)}${unit}`);
      print(`Therefore ${sp} is taller than ${fp} by ${g(d)}${unit}`);
    }
    if (fh === sh) print("Therefore They Have The Same Height");
    println();
  },

  guess: async ({ print, println, int, ch, rand, g }) => {
    let score = 0, totalattempt = 0, again;
    do {
      println("NUMBER GUESSING GAME");
      println("--------------------");
      println("CHOOSE DIFFICULTY");
      println("1 for easy (1-10)");
      println("2 for easy (1-50)");
      println("3 for easy (1-100)");
      const difficulty = await int();
      let number, top;
      if (difficulty === 1) { number = rand(10) + 1; top = 10; }
      else if (difficulty === 2) { number = rand(50) + 1; top = 50; }
      else if (difficulty === 3) { number = rand(100) + 1; top = 100; }
      else { println("Invalid Difficulty"); again = "y"; continue; }
      let attempts = 0, guess;
      println("Guess the number between 1 and " + top);
      do {
        guess = await int();
        attempts++;
        if (guess < number) println("Too Low! Try Again");
        else if (guess > number) println("Too High! Try Again");
      } while (guess !== number);
      totalattempt += attempts;
      score += 100 - attempts * 5;
      println("Cogratulation! You have fund the number in " + attempts + " attempts");
      println("Your score: " + score);
      println("Average attempts: " + g(totalattempt / (difficulty + 1)));
      print("Do you want to paly again[y/n]");
      again = await ch();
    } while (again === "y" || again === "Y");
    println();
  },

  bank: async ({ print, println, int, num, g }) => {
    let balance = 1000, choice = 0;
    const show = () => println("Your Current Balance is: $" + g(balance));
    const deposit = async () => {
      print("Enter Amount to Deposit:"); const a = await num();
      if (a > 0) return a;
      print("Invalid Amount"); return 0;
    };
    const withdraw = async () => {
      print("Enter Amount To Withdraw:"); const a = await num();
      if (a < balance) return a;
      println("Insufficient Amount"); return 0;
    };
    do {
      println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      println("~~~~~~~~BANKING SYSTEM~~~~~~~~");
      println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      println("What would you like to do?");
      println("1. Show Balance"); println("2. Deposit Money"); println("3. Withdraw Money"); println("4. Exit");
      choice = await int();
      switch (choice) {
        case 1: show(); break;
        case 2: balance += await deposit(); show(); break;
        case 3: balance -= await withdraw(); show(); break;
        case 4: print("Thank You!!!"); break;
        default: print("Invalid Response");
      }
    } while (choice !== 4);
    println();
  },

  car: async ({ print, println, int, num, word, g }) => {
    const MAX = 5;
    const brand = ["Chevrolet", "Bugatti", "Nissan", "Pagani", "Ford"];
    const model = ["Camaro", "Veyron", "GT-R5", "Zonda", "Raptor"];
    const price = [500, 656, 450, 600, 200];
    const rented = Array(MAX).fill(false), total = Array(MAX).fill(0), hours = Array(MAX).fill(0);
    const name = [], contact = [];
    let count = 0, choice;
    do {
      println("~~~~~~~~~~Car Renting~~~~~~~~~~");
      println("1. Show Car list"); println("2. Rent Car"); println("3. Return Car");
      println("4. Customer Information"); println("5. Exit");
      choice = await int();
      switch (choice) {
        case 1:
          println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          println("Car No.      Brand Model      Rate Per Hour ");
          for (let i = 0; i < MAX; i++) if (!rented[i]) println(`${i + 1}      ${brand[i]}      ${model[i]}  $${g(price[i])}.00`);
          break;
        case 2: {
          print("Select Car: "); const n = await int();
          if (n > 0 && n <= MAX && !rented[n - 1]) {
            print("Enter name: "); name[count] = await word();
            print("Enter Contact Number: "); contact[count] = await num();
            print("Enter Rent Hours: "); hours[n - 1] = await num();
            total[n - 1] = hours[n - 1] * price[n - 1];
            rented[n - 1] = true; count++;
            println("Car Rented Successfully");
            println("Amount to be Paid:" + g(total[n - 1]) + ".00");
          } else println("Invalid Car Number or Car Already Rented");
          break;
        }
        case 3: {
          print("Enter Car Number: "); const s = await int();
          if (s > 0 && s <= MAX && rented[s - 1]) { rented[s - 1] = false; println("Car Returned Successfully"); }
          else println("Invalid Car Number or Car Not Rented");
          break;
        }
        case 4:
          println("~~~~~Customer Information~~~~~");
          println("Car No.     Customer Name      Contact Number     Amount to Pay ");
          for (let i = 0; i < count; i++) println(`${i + 1} ${name[i]} ${g(contact[i])} $${g(total[i])}.00`);
          break;
        case 5: println("Thank you"); break;
      }
    } while (choice !== 5);
  },

  todo: async ({ print, println, int, getline, ignore }) => {
    const MAX = 10;
    const list = [], note = [], done = [];
    let count = 0, choice;
    do {
      println("~~~~~~~~~~To-DO List~~~~~~~~~~");
      println("1. Show Tasks"); println("2. Add Task"); println("3. Mark Task as Complete");
      println("4. Remove Task"); println("5. Exit");
      choice = await int(); ignore();
      switch (choice) {
        case 1:
          println("~~~~~~~~~~Task To-DO~~~~~~~~~~");
          if (count === 0) println("You Have No Pending Tasks");
          else {
            println("Task No.      Description      Note      Remarks");
            for (let i = 0; i < count; i++) println(`${i + 1}.            ${list[i]}             ${note[i]}      ${done[i] ? "Completed" : "Pending"}`);
          }
          break;
        case 2:
          if (count < MAX) {
            println("~~~~~~~~~~Enter Task~~~~~~~~~~");
            print("Enter Task Description: "); list[count] = await getline();
            print("Enter Task Note: "); note[count] = await getline();
            done[count] = false; count++;
          } else println("Task limit exceeded!");
          break;
        case 3: {
          println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          if (count === 0) println("You Have No Pending Tasks");
          else {
            print("Enter Task Number to Mark as Complete: "); const s = await int(); ignore();
            if (s > 0 && s <= count) { done[s - 1] = true; println("Task marked as complete!"); }
            else println("Invalid task number!");
          }
          break;
        }
        case 4: {
          println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          print("Select Task to Delete: "); const s = await int(); ignore();
          if (s > 0 && s <= count) {
            for (let i = s - 1; i < count - 1; i++) { list[i] = list[i + 1]; note[i] = note[i + 1]; done[i] = done[i + 1]; }
            count--; println("Task removed!");
          } else println("Invalid task number!");
          break;
        }
        case 5: println("Thank You"); break;
        default: println("Invalid choice. Please try again.");
      }
    } while (choice !== 5);
  },

  calc: async ({ print, println, int, num, jd }) => {
    for (;;) {
      println();
      println("===== Calculator sa Java =====");
      println("1.) Add"); println("2.) Subtract"); println("3.) Divide"); println("4.) Multiply"); println("5.) Exit");
      print("Choose an option: ");
      const choice = await int();
      if (choice >= 1 && choice <= 4) {
        print("Enter First Number: "); const a = await num();
        print("Enter Second Number: "); const b = await num();
        if (choice === 1) println("Answer = " + jd(a + b));
        else if (choice === 2) println("Answer = " + jd(a - b));
        else if (choice === 3) println(b === 0 ? "Cannot divide by zero!" : "Answer = " + jd(a / b));
        else println("Answer = " + jd(a * b));
      } else if (choice === 5) { println("Calculator Closed."); return; }
      else println("Invalid Choice!");
    }
  },
};
