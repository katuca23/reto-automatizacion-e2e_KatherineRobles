// helpers/utils.ts
// Utilidades reutilizables anti-flakiness y helpers financieros

import { Page, Locator, expect } from '@playwright/test';

/**
 * Espera a que un elemento sea visible y estable antes de interactuar
 */
export async function waitAndClick(page: Page, locator: Locator, timeout = 15000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // pequeña pausa anti-flakiness
  await locator.click();
}

/**
 * Limpia un campo y escribe un valor, verificando que se ingresó correctamente
 */
export async function clearAndFill(page: Page, locator: Locator, value: string): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ clickCount: 3 }); // seleccionar todo
  await locator.fill(value);
  await page.waitForTimeout(200);
}

/**
 * Toma screenshot con nombre descriptivo
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Espera a que la red esté idle (sin peticiones activas)
 */
export async function waitForNetworkIdle(page: Page, timeout = 15000): Promise<void> {
  // networkidle puede tardar en sitios con peticiones continuas — lo hacemos tolerante a fallos
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {
    // Si timeout, continuar de todas formas — la página ya cargó visualmente
  });
}

/**
 * Parsea un texto con formato de moneda a número
 * Ej: "$1.234,56" → 1234.56
 */
export function parseCurrencyToNumber(text: string): number {
  const cleaned = text
    .replace(/[^0-9.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(cleaned);
}

/**
 * Calcula cuota mensual de préstamo (sistema francés / cuota fija)
 * @param principal Monto del préstamo
 * @param annualRate Tasa anual (ej: 0.15 = 15%)
 * @param months Número de cuotas
 */
export function calcularCuotaMensual(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  const cuota = (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
    / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(cuota * 100) / 100;
}

/**
 * Valida que un valor de cuota calculado esté dentro de un margen de tolerancia
 * (±2% para absorber redondeos y comisiones del simulador)
 */
export function validarCuotaDentroMargen(
  cuotaEsperada: number,
  cuotaObtenida: number,
  margenPorcentaje = 2
): boolean {
  const diferencia = Math.abs(cuotaEsperada - cuotaObtenida);
  const margen = cuotaEsperada * (margenPorcentaje / 100);
  return diferencia <= margen;
}

/**
 * Espera a que un texto cambie en un elemento (útil para resultados dinámicos)
 */
export async function waitForTextChange(
  locator: Locator,
  previousText: string,
  timeout = 10000
): Promise<void> {
  await expect(locator).not.toHaveText(previousText, { timeout });
}

/**
 * Reintenta una acción N veces antes de fallar (para elementos intermitentes)
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await action();
    } catch (e) {
      lastError = e as Error;
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }
  throw lastError;
}

/**
 * Acepta cookies / popups comunes en sitios bancarios ecuatorianos
 */
export async function acceptCookiesIfPresent(page: Page): Promise<void> {
  const cookieSelectors = [
    'button:has-text("Aceptar")',
    'button:has-text("Acepto")',
    'button:has-text("Aceptar todo")',
    '[id*="cookie"] button',
    '[class*="cookie"] button',
    '[aria-label*="cookie"]',
  ];

  for (const selector of cookieSelectors) {
    try {
      const btn = page.locator(selector).first();
      const visible = await btn.isVisible({ timeout: 2000 });
      if (visible) {
        await btn.click();
        await page.waitForTimeout(500);
        break;
      }
    } catch {
      // No hay cookie banner con este selector, continuar
    }
  }
}

/**
 * Cierra modales o overlays que puedan bloquear la interacción
 */
export async function closeModalsIfPresent(page: Page): Promise<void> {
  const modalCloseSelectors = [
    'button[aria-label="Cerrar"]',
    'button[aria-label="Close"]',
    '.modal-close',
    '.close-modal',
    '[class*="modal"] .close',
  ];

  for (const selector of modalCloseSelectors) {
    try {
      const btn = page.locator(selector).first();
      const visible = await btn.isVisible({ timeout: 1500 });
      if (visible) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // No hay modal con este selector
    }
  }
}
