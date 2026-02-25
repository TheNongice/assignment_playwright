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

test.describe('Deposit', () => {
    test(`should deposit`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ฝากเงินDeposit').click();
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        await page.getByRole('button', { name: '฿500.00' }).click();
        await page.getByRole('button', { name: 'ฝากเงิน ฿' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('span[role="status"]')).toContainText('Notification ฝากเงินสำเร็จ');
        let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();

        // Check is shouldn't equal with original.
        await expect(newBalance).not.toBe(balance);

        // Clan text for detected.
        balance = parseInt(balance.substring(23).replace(',', ''));
        newBalance = parseInt(newBalance.substring(23).replace(',', ''));

        // Check new balance is should more than original.
        await expect(newBalance).toBeGreaterThanOrEqual(balance);
    });    
});

test.describe('Withdrawal', () => {
    test(`should withdrawal`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ถอนเงินWithdrawal').click();
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        await page.getByRole('button', { name: '฿500.00' }).click();
        await page.getByRole('button', { name: 'ถอนเงิน ฿' }).click();
        await page.waitForTimeout(500);
        await expect(page.locator('span[role="status"]')).toContainText('Notification ถอนเงินสำเร็จ');
        let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();

        // Check is shouldn't equal with original.
        await expect(newBalance).not.toBe(balance);

        // Clan text for detected.
        balance = parseInt(balance.substring(23).replace(',', ''));
        newBalance = parseInt(newBalance.substring(23).replace(',', ''));

        // Check new balance is should more than original.
        await expect(newBalance).toBeLessThan(balance);
    });

    test(`shouldn't withdrawl (out of money)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ถอนเงินWithdrawal').click();
        await page.getByPlaceholder('0').click();
        
        // Get current balance
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        balance = balance.substring(23).replace(',', '');
        await page.getByPlaceholder('0').fill(balance);

        await page.getByRole('button', { name: 'ถอนเงิน ฿' }).click();
        await page.getByPlaceholder('0').click();
        await page.getByPlaceholder('0').fill('100');
        await page.waitForTimeout(1000);
        await expect(page.locator('form').locator('button').last()).toBeDisabled({ timeout: 10000 });
    });

    test(`shouldn't withdrawal (not step of 100)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ถอนเงินWithdrawal').click();

        // Get current balance and withdrawl it all
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        await page.getByPlaceholder('0').click();
        await page.getByPlaceholder('0').fill('108');
        await page.getByRole('button', { name: 'ถอนเงิน ฿' }).click();

        // Check error validation
        const amountInput = await page.locator('input');
        const message = await amountInput.evaluate((el) => el.validationMessage);
        await expect(message).toContain('Please enter a valid value. The two nearest valid values are');
    });

    test(`shouldn't withdrawl (more than current balance)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ถอนเงินWithdrawal').click();
        await page.getByPlaceholder('0').click();
        
        // Get current balance
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        balance = parseInt(balance.substring(23).replace(',', ''));
        await page.getByPlaceholder('0').fill((balance+100).toString());

        await page.waitForTimeout(1000);
        await expect(page.locator('form').locator('button').last()).toBeDisabled({ timeout: 10000 });
    });    
});