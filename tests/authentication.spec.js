import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { parse } from "csv-parse/sync";

const records = parse(fs.readFileSync(path.join("utility", "input_correct.csv")), {
  columns: true,
  skip_empty_lines: true,
});

const SIZE_USER = 4;
let idx = 1;
const data_test = {}
for (const record of records) {
  if (idx > SIZE_USER)
    break;

  data_test[idx++] = {
    username: record.username,
    password: record.password
  }
}

test.describe('Login Test', () => {
  for (let i=1; i<=SIZE_USER; i++) {
    test(`should login ${i}`, async ({ page }) => {
      await page.locator('body').click();
      await page.goto('https://atm-buddy-lite.lovable.app/');
      await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
      await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[i].username);
      await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
      await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[i].password);
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
      await expect(page.locator('#root')).toContainText('บัญชีเลขที่: ' + data_test[i].username);
      
      await expect(page.locator('p').filter({ hasText: 'ยินดีต้อนรับ' })).toBeVisible();
      await expect(page.getByText('เข้าสู่ระบบกรุณากรอกหมายเลขบัญชีและรหัส PIN')).toBeHidden();
      await expect(page.getByRole('button', { name: 'ออกจากระบบ' })).toBeVisible();
    });

    test(`shouldn't login ${i}`, async ({ page }) => {
      await page.locator('body').click();
      await page.goto('https://atm-buddy-lite.lovable.app/');
      await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
      await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[i].username);
      await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
      await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill('6767');
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
      await page.waitForTimeout(500);
      await expect(page.getByRole('status').getByText('ข้อมูลไม่ถูกต้อง').last()).toBeVisible();
    });  
  }
});

test.describe('Logout Test', () => {
  test('should logout', async ({ page }) => {
    await page.locator('body').click();
    await page.goto('https://atm-buddy-lite.lovable.app/');
    await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
    await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
    await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
    await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page.locator('#root')).toContainText('บัญชีเลขที่: ' + data_test[1].username);
    await expect(page.locator('p').filter({ hasText: 'ยินดีต้อนรับ' })).toBeVisible();

    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
    await expect(page.getByText('ATM BANKINGระบบ ATM อัตโนมัติ')).toBeVisible();
    await expect(page.getByText('ข้อมูลทดลอง:บัญชี: ')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ออกจากระบบ' })).toBeHidden();
    await expect(page.getByText('เข้าสู่ระบบกรุณากรอกหมายเลขบัญชีและรหัส PIN')).toBeVisible();
  });
});