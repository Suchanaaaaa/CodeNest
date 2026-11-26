
import request from "supertest";
import app from "../app.js";
import { jest } from "@jest/globals";

describe("Docker Code Execution Tests", () => {
  jest.setTimeout(30000);

  // Test 1: C Code Execution
  test("Should execute C code successfully", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "c",
        code: `
          #include <stdio.h>

          int main() {
            int a, b;
            scanf("%d %d", &a, &b);
            printf("Result: %d", a + b);
            return 0;
          }
        `,
        input: "15 25",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.output.trim()).toBe("Result: 40");
  });

  // Test 2: C++ Code Execution
  test("Should execute C++ code successfully", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "cpp",
        code: `
          #include <iostream>
          using namespace std;

          int main() {
            int a, b;
            cin >> a >> b;
            cout << "Result: " << a + b;
            return 0;
          }
        `,
        input: "20 30",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.output.trim()).toBe("Result: 50");
  });

  // Test 3: Java Code Execution
  test("Should execute Java code successfully", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "java",
        code: `
          import java.util.Scanner;

          public class Main {
            public static void main(String[] args) {
              Scanner sc = new Scanner(System.in);

              int a = sc.nextInt();
              int b = sc.nextInt();

              System.out.println("Result: " + (a + b));
            }
          }
        `,
        input: "10 20",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.output.trim()).toBe("Result: 30");
  });

  // Test 4: C Compilation Error
  test("Should detect C compilation errors", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "c",
        code: `
          #include <stdio.h>

          int main() {
            printf("Hello World")
            return 0;
          }
        `,
        input: "",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.output).toMatch(/error/i);
  });

  // Test 5: Java Runtime Error
  test("Should detect Java runtime errors", async () => {
    const response = await request(app)
      .post("/api/compiler/run")
      .send({
        language: "java",
        code: `
          public class Main {
            public static void main(String[] args) {
              int a = 10;
              int b = 0;

              System.out.println(a / b);
            }
          }
        `,
        input: "",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/ArithmeticException/i);
  });

  // Test 6: Execution Timeout
test("Should stop programs exceeding execution time limit", async () => {
  const response = await request(app)
    .post("/api/compiler/run")
    .send({
      language: "c",
      code: `
        int main() {
          while (1) {
          }
          return 0;
        }
      `,
      input: "",
    });

  expect(response.statusCode).toBe(500);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toMatch(/Execution time limit exceeded/i);
}, 20000);

// Test 7: Output Limit
test("Should stop programs exceeding output limit", async () => {
  const response = await request(app)
    .post("/api/compiler/run")
    .send({
      language: "c",
      code: `
        #include <stdio.h>

        int main() {
          while (1) {
            printf("CodeNest Output Test\\n");
          }
          return 0;
        }
      `,
      input: "",
    });

  expect(response.statusCode).toBe(500);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toMatch(/Program output limit exceeded/i);
}, 20000);
});
