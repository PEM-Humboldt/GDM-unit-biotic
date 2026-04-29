# GDM & Biotic Zoning

Este repositorio contiene un flujo de trabajo avanzado en **R** para el análisis de la biodiversidad espacial y la zonificación biótica. En la carpeta R se encuentran dos rutinas para análisis de diversidad beta con base en la variación ambiental. El primer caso corresponde a la aplicación del flujo para la definición de las unidades bióticas de Sea Flower [biotic_zoning_workflow_GDM.R](https://github.com/elkalexno/GDM_unit_biotic/blob/develop/biotic_zoning_workflow_GDM.R). Y el segundo corresponde a una actualización del flujo completo, el cual permite usar los datos del paquete GDM para correr el flujo completo  [gdm_zoning_v1.6.R](https://github.com/elkalexno/GDM_unit_biotic/blob/develop/gdm_zoning_v1.6.R). Utiliza modelos de disimilitud generalizada (**GDM**) y algoritmos de agrupación difusa (**Fuzzy C-Means, FCM, geocmeans**) para entender cómo cambian las comunidades biológicas en función de variables ambientales. A diferencia de los algoritmos de agrupación como K-Means, los cuales asignan un elemento a un solo grupo, FCM utiliza la lógica difusa, lo cual permite que un elemento pertenezca a varios grupos simultáneamente con diferentes grados de certeza. La lógica difusa es una disciplina clásica de la IA dedicada a manejar la incertidumbre y la subjetividad de manera similar a como lo hace el razonamiento humano.

El paquete [gdm de R](https://github.com/fitzLab-AL/GDM) utiliza el Modelado de Disimilitud Generalizada (Ferrier et al. 2007) para analizar y mapear patrones espaciales de biodiversidad. GDM modela la variación biológica basándose en el entorno y la geografía (variables biofísicas) mediante matrices de distancia. Específicamente, relaciona la diferencia biológica entre dos lugares o diversidad beta, con qué tan distintas son sus condiciones ambientales (distancia ambiental) y qué tan lejos están uno del otro (distancia geográfica). Tomando en cuenta que GDM es un modelo estadístico que requiere ser entrenado, se sugiere siempre  revisar datos de entrada, variables y número de variables, salidas del modelo. 

## 🚀 Descripción del Proyecto

El análisis se divide en tres fases principales:
1. **Modelado GDM:** Evaluación del recambio de especies (beta-diversidad) basado en variables como altura, pendiente y procesos geofísicos.
2. **Transformación Espacial:** Reducción de dimensionalidad (PCA) de las variables ambientales transformada por el modelo biológico.
3. **Zonificación:** Clasificación del territorio en zonas bióticas homogéneas utilizando clustering difuso espacial (`geocmeans`).

## 🛠️ Requisitos

Para ejecutar este código, asegúrate de tener instaladas las siguientes librerías en R:

```r
install.packages(c("gdm", "terra", "geocmeans", "data.table", "sf", "viridis", "future", "ggplot2"))
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
* **[Elkin A. Noguera-Urbano/Instituto Humboldt]** - *Trabajo inicial y desarrollo* - [@elkalexno](https://github.com)

---
*Este proyecto fue desarrollado bajo el marco del análisis multigrupo para la Reserva de Biósfera SeaFlower (2022).*

## ✒️ Referencias
Ferrier S, Manion G, Elith J, Richardson, K (2007) Using generalized dissimilarity modelling to analyse and predict patterns of beta diversity in regional biodiversity assessment. Diversity & Distributions 13: 252-264.https://doi.org/10.1111/j.1472-4642.2007.00341.x

Mokany K, Ware C, Woolley, SNC, Ferrier S, Fitzpatrick MC (2022) A working guide to harnessing generalized dissimilarity modelling for biodiversity analysis and conservation assessment. Global Ecology and Biogeography, 31, 802– 821. https://doi.org/10.1111/geb.13459

González Martínez, R., Rojas, S., & Noguera Urbano, E. A. (2022). Unidades bióticas del ambiente emergido en el archipiélago de San Andrés, Providencia y Santa Catalina. Instituto de Investigación de Recursos Biológicos Alexander von Humboldt, Ministerio de Ambiente y Desarrollo Sostenible, Corporación para el Desarrollo Sostenible del Archipiélago de San Andrés, Providencia y Santa Catalina (Coralina). (https://repository.humboldt.org.co/entities/publication/eb66fff0-d5f5-47f9-9965-73c0ea5c2f1f)
