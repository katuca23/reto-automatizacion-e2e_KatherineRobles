// pages/SimuladorPage.ts
// Page Object Model - Simulador de Crédito Banco Pichincha
// Corrección: el simulador está dentro de un iframe y usa Shadow DOM abierto.
// En Playwright se debe usar frameLocator(...) y CSS locators, no XPath.

import { Page, Locator, FrameLocator } from '@playwright/test';
import {
  acceptCookiesIfPresent,
  closeModalsIfPresent,
  takeScreenshot,
  waitForNetworkIdle,
} from '../helpers/utils';

export class SimuladorPage {
  readonly page: Page;
  readonly frame: FrameLocator;
  readonly url = 'https://www.pichincha.com/detalle-producto/simulador-de-credito';

  readonly dropdownTipoCredito: Locator;
  readonly inputMonto: Locator;
  readonly dropdownPlazo: Locator;
  readonly radioFrancesa: Locator;
  readonly radioAlemana: Locator;
  readonly btnSimular: Locator;
  readonly contenedorSimulacion: Locator;

  constructor(page: Page) {
    this.page = page;

    // El simulador se renderiza dentro de un iframe.
    // Si en tu página hay más de un iframe, cambia este selector por uno más específico:
    // this.frame = page.frameLocator('iframe[src*="simulador"]');
    this.frame = page.frameLocator('iframe').first();

    this.dropdownTipoCredito = this.frame.locator('pichincha-dropdown[formcontrolname="creditType"]');
    this.inputMonto = this.frame.locator('pichincha-input[formcontrolname="loanValue"]');
    this.dropdownPlazo = this.frame.locator('pichincha-dropdown[formcontrolname="loanTerm"]');
    this.radioFrancesa = this.frame.locator('input#FRANCESA');
    this.radioAlemana = this.frame.locator('input#ALEMANA');
    this.btnSimular = this.frame.locator('pichincha-button[label="Simular"]');
    this.contenedorSimulacion = this.frame.locator('.credit-simulator__content__simulation');
  }

  // ── Navegación ───────────────────────────────────────────────────────────────

  async navegar(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle(this.page);
    await acceptCookiesIfPresent(this.page);
    await closeModalsIfPresent(this.page);
  }

  async esperarCargaSimulador(): Promise<void> {
    await this.frame
      .locator('text=/¿?Qué crédito necesitas\?|Selecciona un tipo de crédito/i')
      .first()
      .waitFor({ state: 'visible', timeout: 30000 });
  }

  // ── Helpers Shadow DOM ───────────────────────────────────────────────────────

  private dropdownInput(formcontrolname: string): Locator {
    return this.frame.locator(
      `pichincha-dropdown[formcontrolname="${formcontrolname}"] .bp-select-multiple__input-container`
    );
  }

  private dropdownOption(formcontrolname: string, textoOpcion: string): Locator {
    // Las opciones pueden estar en li o en otros elementos dentro del shadow root
    // Usamos múltiples estrategias
    return this.frame
      .locator(`pichincha-dropdown[formcontrolname="${formcontrolname}"] .bp-select-multiple__list-container li`)
      .filter({ hasText: textoOpcion })
      .first();
  }

  private nativeInput(formcontrolname: string): Locator {
    return this.frame.locator(`pichincha-input[formcontrolname="${formcontrolname}"] input`).first();
  }

  private nativeButton(label: string): Locator {
    return this.frame.locator(`pichincha-button[label="${label}"] button`).first();
  }

  // ── Selección de dropdown ────────────────────────────────────────────────────

  async seleccionarOpcionDropdown(formcontrolname: string, textoOpcion: string): Promise<void> {
    // 1. Abrir el dropdown
    await this.dropdownInput(formcontrolname).waitFor({ state: 'visible', timeout: 15000 });
    await this.dropdownInput(formcontrolname).click();
    await this.page.waitForTimeout(600);

    // 2. Intentar con li visible en el frame primero
    const opcion = this.dropdownOption(formcontrolname, textoOpcion);
    const visible = await opcion.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await opcion.click();
      return;
    }

    // 3. Fallback: usar evaluate dentro del iframe para acceder al Shadow DOM
    const clicked = await this.page.evaluate(
      ({ fcn, texto }: { fcn: string; texto: string }) => {
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
          try {
            const doc = iframe.contentDocument;
            if (!doc) continue;
            const dd = doc.querySelector(`pichincha-dropdown[formcontrolname="${fcn}"]`) as any;
            const ul = dd?.shadowRoot?.querySelector('.bp-select-multiple__list-container');
            if (!ul) continue;
            const items = ul.querySelectorAll('li');
            for (const li of items) {
              const liText = li.textContent?.trim() ?? '';
              if (liText === texto || liText.includes(texto)) {
                (li as HTMLElement).click();
                return true;
              }
            }
          } catch { /* cross-origin iframe */ }
        }
        return false;
      },
      { fcn: formcontrolname, texto: textoOpcion }
    );

    if (!clicked) {
      throw new Error(`No se encontró la opción "${textoOpcion}" en dropdown "${formcontrolname}"`);
    }
    await this.page.waitForTimeout(500);
  }

  // ── Tipos de crédito ─────────────────────────────────────────────────────────

  async seleccionarCreditoPreciso(): Promise<void> {
    await this.seleccionarOpcionDropdown('creditType', 'PRECISO');
  }

  async seleccionarCreditoHipotecario(): Promise<void> {
    await this.seleccionarOpcionDropdown('creditType', 'HIPOTECARIO VIVIENDA');
  }

  async seleccionarCreditoConsumo(): Promise<void> {
    await this.seleccionarOpcionDropdown('creditType', 'LINEA ABIERTA');
  }

  // ── Ingreso de monto ─────────────────────────────────────────────────────────

  async ingresarMonto(monto: string | number): Promise<void> {
    await this.ingresarValorInput('loanValue', monto);
  }

  async ingresarMontoVivienda(monto: string | number): Promise<void> {
    const inputVivienda = this.frame.locator('pichincha-input[formcontrolname="propertyValue"]');
    const visible = await inputVivienda.isVisible({ timeout: 5000 }).catch(() => false);

    if (visible) {
      await this.ingresarValorInput('propertyValue', monto);
    }
  }

  async ingresarMontoDeseado(monto: string | number): Promise<void> {
    await this.ingresarMonto(monto);
  }

  private async ingresarValorInput(formcontrolname: string, valor: string | number): Promise<void> {
    const input = this.nativeInput(formcontrolname);
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await input.click({ clickCount: 3 });
    await input.fill(String(valor));
    await input.press('Tab');
  }

  // ── Selección de plazo ───────────────────────────────────────────────────────

  async seleccionarPlazo(plazoMeses: number): Promise<void> {
    // Convertir meses al texto exacto del dropdown
    // Opciones: "3 meses", "6 meses", "1 año", "1 año y 6 meses", "2 años", etc.
    const label = this.mesesALabel(plazoMeses);
    await this.seleccionarOpcionDropdown('loanTerm', label);
  }

  private mesesALabel(meses: number): string {
    if (meses < 12) return `${meses} meses`;
    if (meses === 12) return '1 año';
    const años = Math.floor(meses / 12);
    const resto = meses % 12;
    if (resto === 0) return años === 1 ? '1 año' : `${años} años`;
    const mesTexto = resto === 1 ? '1 mes' : `${resto} meses`;
    const añoTexto = años === 1 ? '1 año' : `${años} años`;
    return `${añoTexto} y ${mesTexto}`;
  }

  // ── Selección de amortización ────────────────────────────────────────────────

  async seleccionarAmortizacion(tipo: 'FRANCESA' | 'ALEMANA'): Promise<void> {
    const label = this.frame.locator(`label[for="${tipo}"]`);
    await label.waitFor({ state: 'visible', timeout: 10000 });
    await label.click();
  }

  // ── Simular ──────────────────────────────────────────────────────────────────

  async clickSimular(): Promise<void> {
    const button = this.nativeButton('Simular');
    await button.waitFor({ state: 'visible', timeout: 15000 });
    await button.scrollIntoViewIfNeeded();
    await button.click();

    await waitForNetworkIdle(this.page);
  }

  // ── Resultados ───────────────────────────────────────────────────────────────

  async obtenerTextoCuota(): Promise<string> {
    await this.contenedorSimulacion.waitFor({ state: 'visible', timeout: 15000 });
    return (await this.contenedorSimulacion.textContent()) ?? '';
  }

  async hayResultados(): Promise<boolean> {
    return await this.contenedorSimulacion.isVisible({ timeout: 10000 }).catch(() => false);
  }

  async hayMensajeError(): Promise<boolean> {
    const error = this.frame.locator('pichincha-input[state="error"], [class*="error-message"]');
    return await error.isVisible({ timeout: 3000 }).catch(() => false);
  }

  async tablaAmortizacionVisible(): Promise<boolean> {
    const tabla = this.frame.locator('table, .amortization');
    return await tabla.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async capturarEvidencia(nombre: string): Promise<void> {
    await takeScreenshot(this.page, nombre);
  }
}
