import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { parse } from "csv-parse/sync";

const records = parse(fs.readFileSync(path.join("utility", "input_correct.csv")), {
  columns: true,
  skip_empty_lines: true,
});

const SIZE_USER = 2;
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
        await page.getByRole('button', { name: 'ฝากเงิน' }).click();
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

    test(`should deposit (less than equal 100,000/round)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ฝากเงินDeposit').click();

        for (let round=1; round<=2; round++) {
            let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
            await page.getByPlaceholder('0').fill((100_000).toString());
            await page.getByRole('button', { name: 'ฝากเงิน' }).click();
            await page.waitForTimeout(100);
            await expect(page.locator('span[role="status"]')).toContainText('Notification ฝากเงินสำเร็จ');
            let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
    
            // Check is shouldn't equal with original.
            await expect(newBalance).not.toBe(balance);
            
            // Clan text for detected.
            balance = parseInt(balance.substring(23).replace(',', ''));
            newBalance = parseInt(newBalance.substring(23).replace(',', ''));
            
            // Check new balance is should more than original.
            await expect(newBalance).toBeGreaterThanOrEqual(balance);
            await expect(newBalance).toBe(balance+100_000);
        }
    });

    test(`shouldn't deposit (less than equal 0)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('ฝากเงินDeposit').click();

        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        for (let round=1; round<=2; round++) {
            await page.getByPlaceholder('0').fill((round == 1 ? 0 : -1).toString());
            await expect(page.getByRole('button', { name: 'ฝากเงิน' })).toBeDisabled();
            let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
            
            // Check is should equal with original.
            await expect(newBalance).toBe(balance);
        }
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

    test(`shouldn't withdrawl (more than 50,000/round)`, async ({ page }) => {
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

        await page.getByPlaceholder('0').fill((50_100).toString());

        // Check error validation
        const amountInput = await page.locator('input');
        const message = await amountInput.evaluate((el) => el.validationMessage);
        await expect(message).toContain('Value must be less than or equal to');

        // Check the balance is need to same original
        let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        newBalance = parseInt(newBalance.substring(23).replace(',', ''));
        await expect(newBalance).toEqual(balance);
    });    
});

test.describe('Transfer', () => {
    test(`should transfer`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('โอนเงินTransfer').click();

        // Check it's actually in Transfer state
        await expect(page.getByText('ฝากเงินDeposit')).toBeHidden();
        await expect(page.getByText('ถอนเงินWithdrawal')).toBeHidden();

        // Try to transfer
        await page.getByRole('textbox', { name: 'กรอกหมายเลขบัญชี 6 หลัก' }).click();
        await page.getByRole('textbox', { name: 'กรอกหมายเลขบัญชี 6 หลัก' }).fill(data_test[2].username);

        // Clean text for detected
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        balance = parseInt(balance.substring(23).replace(',', ''));

        await page.getByPlaceholder('0').click();
        await page.getByPlaceholder('0').fill((100).toString());
        await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).click();
        await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).fill('ayyi');
        await page.getByRole('button', { name: 'โอนเงิน ฿' }).click();

        await page.waitForTimeout(500);
        await expect(page.locator('span[role="status"]')).toContainText('Notification โอนเงินสำเร็จ');

        // Check it need to less than original
        let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        newBalance = parseInt(newBalance.substring(23).replace(',', ''));
        await expect(newBalance).toEqual(balance-100);
    });

    test(`shouldn't transfer (transfer more than own balance)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('โอนเงินTransfer').click();

        // Check it's actually in Transfer state
        await expect(page.getByText('ฝากเงินDeposit')).toBeHidden();
        await expect(page.getByText('ถอนเงินWithdrawal')).toBeHidden();

        // Try to transfer
        await page.getByRole('textbox', { name: 'กรอกหมายเลขบัญชี 6 หลัก' }).click();
        await page.getByRole('textbox', { name: 'กรอกหมายเลขบัญชี 6 หลัก' }).fill(data_test[2].username);
        
        // Clan text for detected
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        balance = parseInt(balance.substring(23).replace(',', ''));

        await page.getByPlaceholder('0').click();
        await page.getByPlaceholder('0').fill((balance+1).toString());
        await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).click();
        await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).fill('ayyi');
        await expect(page.getByRole('button', { name: 'โอนเงิน ฿' })).toBeDisabled();

        // Check it need to equal with original
        let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        newBalance = parseInt(newBalance.substring(23).replace(',', ''));
        await expect(newBalance).toEqual(balance);
    });

    test(`shouldn't transfer (character more than 50)`, async ({ page }) => {
        await page.goto('https://atm-buddy-lite.lovable.app/');
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).click();
        await page.getByRole('textbox', { name: 'ตัวอย่าง:' }).fill(data_test[1].username);
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).click();
        await page.getByRole('textbox', { name: 'รหัส PIN 4 หลัก' }).fill(data_test[1].password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.getByText('โอนเงินTransfer').click();

        // Check it's actually in Transfer state
        await expect(page.getByText('ฝากเงินDeposit')).toBeHidden();
        await expect(page.getByText('ถอนเงินWithdrawal')).toBeHidden();

        // Try to transfer
        await page.getByRole('textbox', { name: 'กรอกหมายเลขบัญชี 6 หลัก' }).click();
        await page.getByRole('textbox', { name: 'กรอกหมายเลขบัญชี 6 หลัก' }).fill(data_test[2].username);
        
        // Clan text for detected
        let balance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        balance = parseInt(balance.substring(23).replace(',', ''));

        await page.getByPlaceholder('0').click();
        await page.getByPlaceholder('0').fill((1).toString());

        // Try to input with more than 50 character
        // Results: should max input at 50 and can transfer normally.
        await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).click();
        await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).fill('a'.repeat(51));
        const inputNote = await page.getByRole('textbox', { name: 'เช่น เงินค่าอาหาร, ค่าเช่าบ้าน' }).inputValue();
        await expect(inputNote).toBe('a'.repeat(50));
        await expect(page.getByRole('button', { name: 'โอนเงิน ฿' })).toBeEnabled();
        await page.getByRole('button', { name: 'โอนเงิน ฿' }).click();

        // Wait until complete transfer
        await page.waitForTimeout(500);
        await expect(page.locator('span[role="status"]')).toContainText('Notification โอนเงินสำเร็จ');

        // Check it need to less than original
        let newBalance = await page.locator('div').filter({ hasText: 'ปัจจุบัน฿' }).nth(4).textContent();
        newBalance = parseInt(newBalance.substring(23).replace(',', ''));
        await expect(newBalance).toEqual(balance-1);
    });    
});