import { estadoCitaLabels, getEstadoCitaStyles } from '../../utils/estadoCita';

export default function BadgeEstadoCita({ estado }) {
  const styles = getEstadoCitaStyles(estado);
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles.badge}`}>
      {estadoCitaLabels[estado] || estado}
    </span>
  );
}
