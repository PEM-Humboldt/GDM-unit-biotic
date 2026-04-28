# GDM & Biotic Zoning

Este repositorio contiene un flujo de trabajo avanzado en **R** para el análisis de la biodiversidad espacial y la zonificación biótica. Utiliza modelos de disimilitud generalizada (**GDM**) y algoritmos de agrupación difusa (**Fuzzy C-Means**) para entender cómo cambian las comunidades biológicas en función de variables ambientales.

## 🚀 Descripción del Proyecto

El análisis se divide en tres fases principales:
1. **Modelado GDM:** Evaluación del recambio de especies (beta-diversidad) basado en variables como altura, pendiente y procesos geofísicos.
2. **Transformación Espacial:** Reducción de dimensionalidad (PCA) de las variables ambientales transformada por el modelo biológico.
3. **Zonificación:** Clasificación del territorio en zonas bióticas homogéneas utilizando clustering difuso espacial (`geocmeans`).

## 🛠️ Requisitos

Para ejecutar este código, asegúrate de tener instaladas las siguientes librerías en R:

```r
install.packages(c("gdm", "raster", "geocmeans", "data.table", "sf", "viridis", "future", "ggplot2"))
```

## 📂 Estructura de Datos

Para que el script funcione correctamente, los datos deben estar organizados de la siguiente manera:
- **Datos Biológicos:** Un archivo `.csv` con columnas para `species`, `longitude` y `latitude`.
- **Variables Ambientales:** Archivos `.tif` (rasters) con la misma resolución, extensión y sistema de coordenadas (WGS84).

## 📊 Resultados Principales

El flujo de trabajo genera:
- **GDM PCA (RGB):** Un mapa de composición de colores que visualiza el recambio biótico continuo.
- **Zonificación Biótica:** Un mapa categorizado con las unidades ambientales/biológicas más representativas.

## ✒️ Autor
* **[Elkin A. Noguera-Urbano/Instituto HUmboldt]** - *Trabajo inicial y desarrollo* - [@elkalexno](https://github.com)

---
*Este proyecto fue desarrollado bajo el marco del análisis multigrupo para la Reserva de Biósfera SeaFlower (2022).*

