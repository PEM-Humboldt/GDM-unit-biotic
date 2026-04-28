################################################################################
# Autor Elkin Noguera-Urbano. 28/04/2026
# PROYECTO: Modelado GDM y Zonificación Biótica (SeaFlower)
# ARCHIVO: gdm_zoning_analysis.R
# DESCRIPCIÓN: Análisis de recambio de biodiversidad y clasificación espacial
#              utilizando 'terra' para alto rendimiento.
################################################################################

################################################################################
# PROYECTO: Modelado GDM y Zonificación Biótica (San Andrés - SeaFlower)
# DESCRIPCIÓN: Flujo de trabajo para modelar recambio de especies y zonificación.
# MOTOR: 'terra' y 'data.table' para optimización de memoria y velocidad.
################################################################################

# 1. CARGA DE LIBRERÍAS ----
library(speciesgeocodeR)
library(data.table)
library(gdm)
library(sf)
library(terra)      # Sustituye a 'raster' por su eficiencia
library(geocmeans)
library(ggplot2)
library(future)
library(viridis)

# 2. CARGA Y LIMPIEZA DE DATOS BIOLÓGICOS ----
reg_loc <- read.csv("D:/2022/SeaFlower/Análisis_multigrupo/San_Andres_r.csv", sep = ";")

# Eliminar duplicados de especie y coordenadas
dups2 <- duplicated(reg_loc[, c("species", "longitude", "latitude")])
acg <- reg_loc[!dups2, ]

# Evaluación de sitios según coordenadas únicas
dups3 <- duplicated(reg_loc[, c("longitude", "latitude")])
acg2 <- reg_loc[!dups3, ]
sites <- seq(1, nrow(acg2), 1)
acg2 <- cbind(sites, acg2)
acg2 <- acg2[, -2] # Eliminar columna redundante de especie

# Unión de tablas mediante data.table para eficiencia
DT  <- as.data.table(acg)
DT2 <- as.data.table(acg2)
setkey(DT, longitude, latitude)
setkey(DT2, longitude, latitude)
resultTable <- DT[DT2]

# 3. CARGA DE VARIABLES AMBIENTALES ----
folder <- "D:/2022/SeaFlower/Raster_variables/San_andres/Resample"
file_list <- list.files(path = folder, pattern = "\\.tif$", full.names = TRUE)

# Cargar capas como SpatRaster y proyectar a WGS84
envs <- rast(file_list) 
envs <- project(envs, "epsg:4326")

# 4. EXTRACCIÓN DE VALORES Y PREPARACIÓN DE TABLAS ----
latlong <- as.matrix(resultTable[, .(longitude, latitude)])
presvals <- terra::extract(envs, latlong)

# Consolidación del dataframe 'data_tonina' (siguiendo tu lógica original)
data_tonina <- data.frame(
  species = resultTable$species,
  site    = resultTable$sites,
  presvals[, -1], # Eliminar columna ID de terra::extract
  Long    = resultTable$longitude,
  Lat     = resultTable$latitude
)

# Limpiar NAs y renombrar columnas
data_tonina <- na.omit(data_tonina)
colnames(data_tonina) <- c("species", "site", "Altura", "IntProcess", 
                           "Orient", "Pend", "Process", "Long", "Lat")

# 5. MODELADO GDM ----
sppTab <- data_tonina[, c("species", "site", "Long", "Lat")]
envTab <- data_tonina[, c("site", "Altura", "IntProcess", "Orient", "Pend", "Process", "Long", "Lat")]

# Formato sitio-par y ajuste del modelo
gdmTab <- formatsitepair(sppTab, bioFormat = 2, XColumn = "Long", YColumn = "Lat",
                         sppColumn = "species", siteColumn = "site", predData = envTab)

gdm.1 <- gdm(gdmTab, geo = TRUE)
summary(gdm.1)

# GDM usando el stack de rasters directamente
gdmTab.rast <- formatsitepair(sppTab, bioFormat = 2, XColumn = "Long", YColumn = "Lat",
                              sppColumn = "species", siteColumn = "site", predData = envs)
gdmTab.rast <- na.omit(gdmTab.rast)
gdm.rast <- gdm(gdmTab.rast, geo = TRUE)

# 6. TRANSFORMACIÓN Y PCA (Visualización RGB) ----
gdm.trans.data <- gdm.transform(gdm.rast, envs)

# Reducción de dimensiones
sample.trans <- spatSample(gdm.trans.data, 10000, na.rm = TRUE)
sample.pca   <- prcomp(sample.trans, scale. = TRUE)
gdm.pca      <- predict(gdm.trans.data, sample.pca, index = 1:3)

# Normalización a rango 0-1
gdm.pca <- (gdm.pca - minMax(gdm.pca)[1,]) / (minMax(gdm.pca)[2,] - minMax(gdm.pca)[1,])

# Exportar Raster PCA
writeRaster(gdm.pca, filename = 'C:/Users/elkin.noguera/Documents/gdm.pcacc_san_andres.tif', 
            overwrite = TRUE)

# 7. ZONIFICACIÓN CON GEOCMEANS (Fuzzy K-Means) ----
# Convertir SpatRaster a lista de capas
dataset <- as.list(gdm.pca)
names(dataset) <- names(gdm.pca)

# Configurar computación paralela (actualizado de multiprocess a multisession)
future::plan(future::multisession, workers = 6)

# Selección de parámetros óptimos (k y m)
FCMvalues <- select_parameters.mc(algo = "FCM", data = dataset, 
                                  k = 5:10, m = seq(1.1, 2, 0.1), spconsist = FALSE, 
                                  indices = c("Explained.inertia", "Silhouette.index"),
                                  verbose = TRUE)

# Ejecución del algoritmo final
FCM_result <- CMeans(dataset, k = 6, m = 1.9, standardize = TRUE,
                     verbose = FALSE, seed = 789, tol = 0.001, init = "kpp")

# 8. EXPORTACIÓN DE RESULTADOS Y GUARDADO ----
# Guardar raster de grupos
writeRaster(FCM_result$rasters$Groups, 
            filename = 'C:/Users/elkin.noguera/Documents/Grupos_san_andres.tif', 
            overwrite = TRUE)

# Guardar imagen del espacio de trabajo
save.image("D:/2022/SeaFlower/GDM/gdm_San_Andres.RData")

# Visualización rápida
plot(FCM_result$rasters$Groups, col = viridis(6), main = "Zonificación Biótica")


