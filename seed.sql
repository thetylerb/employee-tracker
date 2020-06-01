INSERT INTO departments(name) VALUES('IT');
INSERT INTO departments(name) VALUES('HR');

INSERT INTO roles (title, salary, department_id) VALUES ('Full Stack Developer', 70000, 2);
INSERT INTO roles (title, salary, deparment_id) VALUES ('Junior Developer', 40000, 2);

INSERT INTO employee (first_name, last_name, role_id) VALUES ('Brandon', 'Pfeifer', 2);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Tyler', 'Buck', 2);

SELECT * FROM employee;
SELECT * FROM roles;
SELECT * FROM departments;