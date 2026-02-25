import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { parse } from "csv-parse/sync";

const records = parse(fs.readFileSync(path.join("utility", "input_correct.csv")), {
  columns: true,
  skip_empty_lines: true,
});

const SIZE_USER = 3;
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

test.describe('History', () => {
    test(`Check all`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ประวัติHistory').click();

        let currentState = await page.getByRole('button', { name: 'ทั้งหมด' }).textContent();
        currentState = parseInt(currentState.match(/\d+/)?.[0] || '0');

        const allTransactions = await page.locator(`xpath=/html/body/div/div[2]/div/div[4]/div[2]/div[1]//div[contains(@class, 'flex items-center justify-between p-4')]`);
        await expect(currentState).toEqual(await allTransactions.count());
    });

    test(`Check withdrawl`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ประวัติHistory').click();
        await page.getByRole('button', { name: 'ถอนเงิน' }).click();

        let currentState = await page.getByRole('button', { name: 'ถอนเงิน' }).textContent();
        currentState = parseInt(currentState.match(/\d+/)?.[0] || '0');

        const allTransactions = await page.locator(`xpath=/html/body/div/div[2]/div/div[4]/div[2]/div[1]//div[contains(@class, 'flex items-center justify-between p-4')]`);
        await expect(currentState).toEqual(await allTransactions.count());
    });

    test(`Check deposit`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[3].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[3].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ประวัติHistory').click();
        await page.getByRole('button', { name: 'ฝากเงิน' }).click();

        let currentState = await page.getByRole('button', { name: 'ฝากเงิน' }).textContent();
        currentState = parseInt(currentState.match(/\d+/)?.[0] || '0');

        const allTransactions = await page.locator(`xpath=/html/body/div/div[2]/div/div[4]/div[2]/div[1]//div[contains(@class, 'flex items-center justify-between p-4')]`);
        await expect(currentState).toEqual(await allTransactions.count());
    });  

    test(`Check transfer`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ประวัติHistory').click();
        await page.getByRole('button', { name: 'โอนเงิน' }).click();

        let currentState = await page.getByRole('button', { name: 'โอนเงิน' }).textContent();
        currentState = parseInt(currentState.match(/\d+/)?.[0] || '0');

        const allTransactions = await page.locator(`xpath=/html/body/div/div[2]/div/div[4]/div[2]/div[1]//div[contains(@class, 'flex items-center justify-between p-4')]`);
        await expect(currentState).toEqual(await allTransactions.count());
    });  
})
