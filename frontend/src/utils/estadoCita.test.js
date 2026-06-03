import { describe, expect, it } from 'vitest';
import { getEstadoCitaStyles } from './estadoCita';

describe('getEstadoCitaStyles', () => {
  it('CONFIRMADA usa colores emerald', () => {
    const styles = getEstadoCitaStyles('CONFIRMADA');
    expect(styles.badge).toContain('emerald');
  });

  it('PENDIENTE usa colores amber', () => {
    const styles = getEstadoCitaStyles('PENDIENTE');
    expect(styles.badge).toContain('amber');
  });

  it('estado desconocido usa colores slate', () => {
    const styles = getEstadoCitaStyles('DESCONOCIDO');
    expect(styles.badge).toContain('slate');
  });
});
