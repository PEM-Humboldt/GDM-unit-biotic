################################################################################
# Autor Elkin Noguera-Urbano. 28/04/2026
# PROYECTO: Modelado GDM y Zonificación Biótica (SeaFlower)
# ARCHIVO: gdm_zoning_analysis.R
# DESCRIPCIÓN: Análisis de recambio de biodiversidad y clasificación espacial
#              utilizando 'terra' para alto rendimiento.
################################################################################

# 1. CARGA DE LIBRERÍAS ----
# Se utilizan las versiones más eficientes para manejo de datos espaciales y tablas
library(data.table)   # Procesamiento de tablas a alta velocidad
library(gdm)          # Generalized Dissimilarity Modeling
library(terra)        # Motor geoespacial (sucesor de 'raster')
library(geocmeans)    # Clustering difuso espacial
library(future)       # Computación en paralelo
library(viridis)      # Paletas de colores científicas
library(ggplot2)      # Visualización estadística

# 2. GESTIÓN DE DATOS BIOLÓGICOS ----
# Cargar registros de ocurrencia
reg_loc <- read.csv("D:/2022/SeaFlower/Análisis_multigrupo/San_Andres_r.csv", sep = ";")

# Limpieza: Únicos por especie y coordenadas para evitar sesgos
acg <- unique(reg_loc[, c("species", "longitude", "latitude")])

# Definición de Sitios Únicos: Necesario para la matriz de disimilitud del GDM
acg2 <- unique(reg_loc[, c("longitude", "latitude")])
acg2$site <- seq_len(nrow(acg2)) 

# Unión eficiente usando data.table (Indexación por coordenadas)
DT <- as.data.table(acg)
DT2 <- as.data.table(acg2)
setkey(DT, longitude, latitude)
setkey(DT2, longitude, latitude)
resultTable <- DT[DT2]

# 3. VARIABLES AMBIENTALES (Motor terra) ----
folder_env <- "D:/2022/SeaFlower/Raster_variables/San_andres/Resample"
file_list  <- list.files(path = folder_env, pattern = "\\.tif$", full.names = TRUE)

# Carga de SpatRaster (Carga perezosa, eficiente en memoria)
envs <- rast(file_list) 

# Asegurar Sistema de Referencia de Coordenadas (WGS84)
envs <- project(envs, "epsg:4326")

# 4. EXTRACCIÓN Y PREPARACIÓN DEL MODELO ----
# Extraer valores ambientales en las coordenadas de los sitios
coords   <- as.matrix(resultTable[, .(longitude, latitude)])
presvals <- terra::extract(envs, coords)

# Construir tabla final de entrenamiento (eliminando ID de extracción)
data_final <- data.frame(
  species = resultTable$species,
  site    = resultTable$site,
  presvals[, -1], 
  Long    = resultTable$longitude,
  Lat     = resultTable$latitude
)

# Limpiar registros fuera de la máscara ambiental
data_final <- na.omit(data_final)

# Definir nombres de columnas (Ajustar según nombres de tus .tif)
colnames(data_final) <- c("species", "site", "Altura", "IntProcess", 
                          "Orient", "Pend", "Process", "Long", "Lat")

# 5. MODELADO DE DISIMILITUD GENERALIZADA (GDM) ----
# Preparar tablas de formato 'site-pair'
sppTab <- data_final[, c("species", "site", "Long", "Lat")]
envTab <- data_final[, c("site", "Altura", "IntProcess", "Orient", "Pend", "Process", "Long", "Lat")]

gdmTab <- formatsitepair(sppTab, bioFormat = 2, XColumn = "Long", YColumn = "Lat",
                         sppColumn = "species", siteColumn = "site", predData = envTab)

# Ajustar el modelo GDM con distancia geográfica habilitada
gdm_model <- gdm(gdmTab, geo = TRUE)
summary(gdm_model)

# 6. TRANSFORMACIÓN AMBIENTAL Y PCA ----
# Transformar las capas originales según la importancia biológica calculada
gdm_trans <- gdm.transform(gdm_model, envs)

# Reducción de dimensiones mediante PCA sobre 10,000 puntos aleatorios
sample_pts <- spatSample(gdm_trans, 10000, na.rm = TRUE)
pca_model  <- prcomp(sample_pts, scale. = TRUE)

# Predecir los 3 primeros componentes para visualización RGB
gdm_pca <- predict(gdm_trans, pca_model, index = 1:3)

# Normalización 0 a 1 para salida estándar
gdm_pca_min  <- minMax(gdm_pca)[1, ]
gdm_pca_max  <- minMax(gdm_pca)[2, ]
gdm_pca_norm <- (gdm_pca - gdm_pca_min) / (gdm_pca_max - gdm_pca_min)

# Guardar Raster PCA (Compuesto RGB de biodiversidad)
writeRaster(gdm_pca_norm, "gdm_pca_rgb.tif", overwrite = TRUE)

# 7. ZONIFICACIÓN MEDIANTE CLUSTERING DIFUSO ----
# Convertir SpatRaster a lista para compatibilidad con geocmeans
dataset <- as.list(gdm_pca_norm)

# Activar paralelismo (Multisession es compatible con todos los SO)
future::plan(future::multisession, workers = 6)

# Ejecutar Fuzzy C-Means (Parámetros optimizados k=6, m=1.9)
fcm_res <- CMeans(dataset, k = 6, m = 1.9, standardize = TRUE, 
                  seed = 789, init = "kpp")

# 8. EXPORTACIÓN FINAL ----
# El resultado Groups indica la zona más probable para cada celda
writeRaster(fcm_res$rasters$Groups, "zonificacion_biotica_final.tif", overwrite = TRUE)

# Visualización rápida del resultado
plot(fcm_res$rasters$Groups, col = viridis(6), main = "Zonificación Biótica (Motor Terra)")

# Guardar sesión para trazabilidad
save.image("gdm_analysis_terra.RData")

