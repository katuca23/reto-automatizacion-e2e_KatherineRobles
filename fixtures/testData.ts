// fixtures/testData.ts
// Datos de prueba centralizados para todos los flujos E2E

export const URL_SIMULADOR = 'https://www.pichincha.com/detalle-producto/simulador-de-credito';

export const CREDITO_PRECISO = {
  tipo: 'PRECISO',
  monto: 10000,
  montoStr: '10000',
  plazoMeses: 24,
  plazoLabel: '2 años',       // Texto exacto del dropdown
  tipoAmortizacion: 'FRANCESA',
};

export const CREDITO_HIPOTECARIO = {
  tipo: 'HIPOTECARIO VIVIENDA',
  montoVivienda: 100000,
  montoViviendaStr: '100000',
  montoDeseado: 80000,
  montoDeseadoStr: '80000',
  plazoMeses: 120,
  plazoLabel: '10 años',      // Texto exacto del dropdown
  tipoAmortizacion: 'FRANCESA',
};

export const VALIDACIONES_INVALIDAS = {
  montoNegativo: '-5000',
  montoTexto: 'abcdef',
  montoMuyBajo: '1',
  montoMuyAlto: '99999999',
  plazoCero: '0',
  plazoNegativo: '-12',
};

export const ESCENARIOS_CALCULOS = [
  { monto: 5000,  plazo: 12,  label: 'Monto bajo - plazo corto'  },
  { monto: 10000, plazo: 24,  label: 'Monto medio - plazo medio' },
  { monto: 20000, plazo: 36,  label: 'Monto alto - plazo largo'  },
];

export const RESOLUCIONES = [
  { width: 1920, height: 1080, label: 'Full HD Desktop'  },
  { width: 1280, height: 720,  label: 'HD Desktop'       },
  { width: 768,  height: 1024, label: 'Tablet Portrait'  },
  { width: 375,  height: 812,  label: 'Mobile iPhone X'  },
];
