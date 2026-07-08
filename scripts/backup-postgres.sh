#!/bin/bash

set -e

# ============================================
# Backup PostgreSQL CloudDent -> AWS S3
# ============================================

DATE=$(date +"%Y-%m-%d_%H-%M")

# Configuración local
BACKUP_DIR="/home/ubuntu/CloudDent/backups/postgres"

# Configuración AWS S3
S3_BUCKET="clouddent"
S3_PATH="postgres"

# Archivo generado
FILE="clouddent_${DATE}.sql.gz"

BACKUP_FILE="${BACKUP_DIR}/${FILE}"


echo "======================================"
echo " Backup PostgreSQL - CloudDent"
echo " Fecha: ${DATE}"
echo "======================================"


# Crear carpeta de backups si no existe
mkdir -p "${BACKUP_DIR}"


echo "[1/3] Generando dump PostgreSQL..."


docker exec clouddent-db \
pg_dump \
-U clouddent \
-d clouddent \
| gzip > "${BACKUP_FILE}"


# Validar creación del archivo

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: No se pudo generar el backup"
    exit 1
fi


echo "Backup generado correctamente:"
ls -lh "${BACKUP_FILE}"



echo "[2/3] Subiendo backup a AWS S3..."


aws s3 cp \
"${BACKUP_FILE}" \
"s3://${S3_BUCKET}/${S3_PATH}/${FILE}"



echo "[3/3] Validando archivo en S3..."


aws s3 ls \
"s3://${S3_BUCKET}/${S3_PATH}/${FILE}"


echo ""
echo "======================================"
echo " Backup completado correctamente"
echo " Ubicación:"
echo " s3://${S3_BUCKET}/${S3_PATH}/${FILE}"
echo "======================================"