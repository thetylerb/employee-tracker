const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require ('console.table')

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "12345678",
  database: "employees_db"
});

connection.connect(function (err) {
  if (err) throw err;
  runManagement();
});


function runManagement() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View Departments",
        "View Roles",
        "View Employees",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee",
        "Exit"
      ]
    })
    .then(function (answer) {
      switch (answer.action) {
        case "View Departments":
          viewDepartments();
          break;

        case "View Roles":
          viewRoles();
          break;

        case "View Employees":
          viewEmployees();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee":
          updateEmployee();
          break;

        case "Exit":
          exit();
          break;
      }
    });
}

function exit() {
  connection.end()
}


function viewDepartments() {
  const query = "SELECT * FROM departments";
  connection.query(query, function (err, res) {
    for (let i = 0; i < res.length; i++) {
      console.table([
        {
          id: `${res[i].id.toString().padEnd(4)}`,
          Department: `${res[i].department_name.padEnd(20)}`
        }]
      )}
    runManagement();
  });
}


function viewRoles() {
  const query = "SELECT title, salary, department_name FROM roles JOIN departments ON department_id = departments.id";
  connection.query(query, function (err, res) {
    for (let i = 0; i < res.length; i++) {
      console.table([
        {
          Title: `${res[i].title.padEnd(30)}`,
          Salary: `$${res[i].salary.toString().padEnd(8)}`,
          Department: `${res[i].department_name.padEnd(20)}`
        }
      ])
    }
    runManagement();
  });

}

function viewEmployees() {
  const query =
    `SELECT title, salary, CONCAT(e.first_name, ' ', e.last_name) AS employee, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employees e
  LEFT JOIN roles ON roles.id = e.role_id
  LEFT JOIN employees m ON m.id = e.manager_id
  `
  connection.query(query, function (err, res) {
    for (let i = 0; i < res.length; i++) {
      console.table([
        {
          Name: `${res[i].employee.padEnd(20)}`,
          Role: `${res[i].title.padEnd(25)}`,
          Salary: `${res[i].salary.toString().padEnd(10)}`,
          Manager: `${res[i].manager}`
        } 
      ])
    }
    runManagement();
  });
}

function addEmployee() {
  connection.query("SELECT * FROM roles", (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([{
          name: "first_name",
          type: "input",
          message: "What is the employee's first name?"
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "role",
          message: "What is the employee's job title?",
          choices: () => {
            const choiceArray = [];
            for (let i = 0; i < results.length; i++) {
              choiceArray.push(results[i].title)
            }
            return choiceArray;
          },
        },
        // {
        //   name: "manager",
        //   type: "list",
        //   choices: employeeArray,
        //   message: "Who is the employee's manager?"
        // }
      ])
      .then(function (data) {

        let chosenRole;
        for (let i = 0; i < results.length; i++) {
          if (results[i].title === data.role) {
            chosenRole = results[i]
          }
        }

        // let chosenManager;
        // for (let i = 0; i < results.length; i++) {
        //   if (`${results[i].first_name} ${results[i].last_name}` === data.employee){
        //     chosenManager = results[i]
        //   }
        // }

        const query = connection.query(
          "INSERT INTO employees SET ?", {
            first_name: data.first_name,
            last_name: data.last_name,
            role_id: chosenRole.id,
            // manager_id: chosenManager.id
          },
          (err, res) => {
            if (err) throw err;
            console.log("Employee Added!")
            runManagement();
          }
        )
      })
  })
}

function addDepartment() {
  inquirer
    .prompt([{
      name: "department_name",
      type: "input",
      message: "What is the name of the department?"
    }])
    .then(function (data) {
      const query = connection.query(
        "INSERT INTO departments SET ?", {
          department_name: data.department_name
        },
        (err, res) => {
          if (err) throw err;
          console.log('Department Added!')
          runManagement();
        }
      )
    })
}

function addRole() {
  connection.query("SELECT * FROM departments", (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([{
          name: "title",
          type: "input",
          message: "What is the job title?"
        }, {
          name: "salary",
          type: "number",
          message: "What is the salary?"
        },
        {
          name: "department",
          type: "list",
          message: "Which department is it in?",
          choices: () => {
            const choiceArray = [];
            for (let i = 0; i < results.length; i++) {
              choiceArray.push(results[i].department_name)
            }
            return choiceArray
          },
        },


      ]).then(function (data) {
        let chosenDepartment;
        for (let i = 0; i < results.length; i++) {
          if (results[i].department_name === data.department) {
            chosenDepartment = results[i]
          }
        }

        const query = connection.query(
          "INSERT INTO roles SET ?", {
            title: data.title,
            salary: data.salary,
            department_id: chosenDepartment.id
          },
          (err, res) => {
            if (err) throw err;
            console.log("Role Added!")
          }
        )
        runManagement()
      })
  })
}

function updateEmployee() {
  connection.query("SELECT * FROM employees", (err, results) => {
    inquirer
      .prompt([{
        name: "employee",
        type: "list",
        message: "Which employee would you like to update?",
        choices: () => {
          const choiceArray = [];
          for (let i = 0; i < results.length; i++) {
            choiceArray.push(`${results[i].first_name} ${results[i].last_name}`)
          }
          return choiceArray
        }
      }])
      .then(function (data) {
        let chosenEmployee;
        for (let i = 0; i < results.length; i++) {
          if (`${results[i].first_name} ${results[i].last_name}` === data.employee) {
            chosenEmployee = results[i]
          }
        }
        connection.query("SELECT * FROM roles",
          (err, results) => {
            if (err) throw err;

            inquirer
              .prompt([{
                  name: "role",
                  type: "list",
                  message: "What is the employee's new role?",
                  choices: () => {
                    const choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                      choiceArray.push(results[i].title)
                    }
                    return choiceArray
                  }
                },

              ]).then(function (data) {
                let chosenRole;
                for (let i = 0; i < results.length; i++) {
                  if (results[i].title === data.role) {
                    chosenRole = results[i]
                  }
                }

                const query = connection.query("UPDATE employees SET ? WHERE ?",
                  [{
                      role_id: chosenRole.id
                    },
                    {
                      id: chosenEmployee.id
                    }
                  ], (err) => {
                    if (err) throw err;
                    console.log("Update Successful!")
                    runManagement()
                  })
              })
          })
      })
  })
}