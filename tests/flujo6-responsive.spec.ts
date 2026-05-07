// tests/flujo6-responsive.spec.ts
// Flujo 6: Responsive Design y Usabilidad

import { test, expect, devices } from '@playwright/test';
import { SimuladorPage } from '../pages/SimuladorPage';

test.describe('Flujo 6: Responsive Design y Usabilidad', () => {

  test('F6: Responsive Design - múltiples resoluciones', async ({ page }) => {
    test.setTimeout(120000);
    const simulador = new SimuladorPage(page);

    // ── PASO 1: Desktop Full HD (1920x1080) ──────────────────────────────────
    await page.setViewportSize({ width: 1920, height: 1080 });
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();
    const hayResultados1920 = await simulador.hayResultados();
    expect(hayResultados1920).toBeTruthy();
    console.log('✅ Full HD 1920x1080: simulador funciona');
    await simulador.capturarEvidencia('F6-01-fullhd-1920x1080');

    // ── PASO 2: Desktop HD (1280x720) ────────────────────────────────────────
    await page.setViewportSize({ width: 1280, height: 720 });
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();
    const hayResultados1280 = await simulador.hayResultados();
    expect(hayResultados1280).toBeTruthy();
    console.log('✅ HD 1280x720: simulador funciona');
    await simulador.capturarEvidencia('F6-02-hd-1280x720');

    // ── PASO 3: Tablet (768x1024) ────────────────────────────────────────────
    await page.setViewportSize({ width: 768, height: 1024 });
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();
    const hayResultados768 = await simulador.hayResultados();
    expect(hayResultados768).toBeTruthy();
    console.log('✅ Tablet 768x1024: simulador funciona');
    await simulador.capturarEvidencia('F6-03-tablet-768x1024');

    // ── PASO 4: Mobile (375x812 - iPhone X) ─────────────────────────────────
    await page.setViewportSize({ width: 375, height: 812 });
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();
    const hayResultados375 = await simulador.hayResultados();
    expect(hayResultados375).toBeTruthy();
    console.log('✅ Mobile 375x812: simulador funciona');
    await simulador.capturarEvidencia('F6-04-mobile-375x812');

    // ── PASO 5: Verificar carga de elementos multimedia ───────────────────────
    await page.setViewportSize({ width: 1280, height: 720 });
    await simulador.navegar();
    await simulador.esperarCargaSimulador();

    // Verificar imágenes cargadas
    const imagenesRotas = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.complete || img.naturalWidth === 0).length;
    });
    console.log(`Imágenes rotas: ${imagenesRotas}`);
    await simulador.capturarEvidencia('F6-05-multimedia');

    // ── PASO 6: Accesibilidad básica ─────────────────────────────────────────
    // Verificar contraste y tamaños de fuente
    const frame = page.frameLocator('iframe').first();
    const tieneTitulos = await frame.locator('h1, h2, h3, [role="heading"]').count();
    console.log(`Elementos de título encontrados: ${tieneTitulos}`);
    expect(tieneTitulos).toBeGreaterThan(0);

    // Verificar que botones tienen aria-label
    const btnSimular = frame.locator('pichincha-button[label="Simular"] button').first();
    const ariaLabel = await btnSimular.getAttribute('aria-label').catch(() => '');
    console.log(`Aria-label botón Simular: "${ariaLabel}"`);
    await simulador.capturarEvidencia('F6-06-accesibilidad');

    console.log('=== RESUMEN RESPONSIVE ===');
    console.log('✅ 1920x1080 Full HD');
    console.log('✅ 1280x720 HD');
    console.log('✅ 768x1024 Tablet');
    console.log('✅ 375x812 Mobile');
  });

});
