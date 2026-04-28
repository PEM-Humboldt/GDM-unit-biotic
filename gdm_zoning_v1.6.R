################################################################################
# # Autor Elkin Noguera-Urbano. 28/04/2026
# RUTINA ACTUALIZADA: GDM v1.6 (Basada en 'terra')
# Datos Oficiales del Paquete: fitzLab-AL/gdm
################################################################################
devtools::install_github("cran/fclust")
library(gdm)
library(terra)      # Imprescindible para la versión 1.6+
library(data.table)
library(geocmeans)
library(future)
library(ggplot2)
library(fclust)
library(viridis)


# 1. CARGA DE DATOS OFICIALES DEL PAQUETE ----
# Nota: La estructura interna de datos ha cambiado en v1.6
data(southwest)  # Datos biológicos (x-y species list)
# Cargar rasters de ejemplo (Australia) directamente con terra
swBioclims <- rast(system.file("./extdata/swBioclims.grd", package="gdm"))

# 2. PREPARACIÓN SEGÚN TU RUTINA ORIGINAL ----
# Simulamos tu 'reg_loc' usando 'southwest'
reg_loc <- southwest[, c("species", "Long", "Lat")]
colnames(reg_loc) <- c("species", "longitude", "latitude")

# Eliminamos duplicados (Paso lógico original)
dups2 <- duplicated(reg_loc[, c("species", "longitude", "latitude")])
acg   <- reg_loc[!dups2, ]

# Evaluación de sitios únicos
dups3 <- duplicated(reg_loc[, c("longitude", "latitude")])
acg2  <- reg_loc[!dups3, ]
sites <- seq(1, nrow(acg2), 1)
acg2  <- cbind(sites, acg2[, c("longitude", "latitude")])

# Unión con data.table
DT  <- as.data.table(acg)
DT2 <- as.data.table(acg2)
setkey(DT, longitude, latitude)
setkey(DT2, longitude, latitude)
resultTable <- DT[DT2]

# 3. EXTRACCIÓN Y TABLA data_tonina ----
# En terra, extract devuelve un ID en la primera columna
# ... (Pasos previos iguales)

latlong  <- as.matrix(resultTable[, .(longitude, latitude)])
presvals <- terra::extract(swBioclims, latlong)

data_tonina <- data.frame(
  species = resultTable$species,
  site    = resultTable$sites,
  presvals[, -1], 
  Long    = resultTable$longitude,
  Lat     = resultTable$latitude
)
data_tonina <- na.omit(data_tonina)

# 4. MODELADO GDM  ----
# Forzamos la conversión a data.frame estándar
sppTab <- as.data.frame(data_tonina[, c("species", "site", "Long", "Lat")])
envTab <- as.data.frame(data_tonina[, c(2:6, 7:8)]) # site, variables, Long, Lat

gdmTab <- formatsitepair(bioData = sppTab, 
                         bioFormat = 2, 
                         XColumn = "Long", 
                         YColumn = "Lat",
                         sppColumn = "species", 
                         siteColumn = "site", 
                         predData = envTab)

gdm.1 <- gdm(gdmTab, geo = TRUE)


# 5. TRANSFORMACIÓN Y PCA ----

gdm.trans.data <- gdm.transform(gdm.1, swBioclims)

# Muestreo espacial
sample.trans <- spatSample(gdm.trans.data, 10000, na.rm=TRUE)

# FILTRO: Eliminar columnas con varianza cero (constantes)
# Esto evita el error en prcomp al escalar
col_vars <- apply(sample.trans, 2, var)
sample.trans_filtered <- sample.trans[, col_vars > 0]

# PCA sobre las columnas filtradas
sample.pca <- prcomp(sample.trans_filtered, scale. = TRUE)

# Al predecir, el modelo PCA solo usará las capas que pasaron el filtro
gdm.pca <- predict(gdm.trans.data[[names(col_vars)[col_vars > 0]]], sample.pca, index = 1:3)

# Normalización 0-1 (usando minMax de terra)
lims <- minmax(gdm.pca)  # minmax en minúsculas
gdm.pca_norm <- (gdm.pca - lims[1,]) / (lims[2,] - lims[1,])

# Visualización para confirmar
plotRGB(gdm.pca_norm * 255)


# 6. ZONIFICACIÓN (GEOCMEANS) ----
dataset <- as.list(gdm.pca_norm)
future::plan(future::multisession, workers = 4)

# Esta función evalúa múltiples combinaciones de k y m
FCM_eval <- select_parameters.mc(algo = "FCM", data = dataset, 
                                 k = 5:8, m = seq(1.1, 2, 0.1), 
                                 spconsist = FALSE, 
                                 indices = c("Explained.inertia", "Silhouette.index"),
                                 verbose = TRUE)


# Gráfico de Silueta
ggplot(FCM_eval) + 
  geom_raster(aes(x = m, y = k, fill = Silhouette.index)) + 
  geom_text(aes(x = m, y = k, label = round(Silhouette.index, 2)), size = 3) +
  scale_fill_viridis() +
  coord_fixed(ratio = 0.2) +
  labs(title = "Índice de Silueta")

### Interpretación:
# La combinación ganadora es y (o incluso), 
# donde se alcanza valores de silueta de 0.69 - 0.70.
# Un valor de 0.7 es 
# excelente para datos bióticos. 
# Indica que las 6 zonas que estás proponiendo 
# tienen una estructura interna muy sólida y 
# están bien diferenciadas entre sí.
# 
# Que los valores se encuentren en el lado derecho del gráfico 
# sugiere que el área de estudio no tiene 
# fronteras tajantes entre unidades, sino que 
# las zonas bióticas se desvanecen gradualmente una en la otra.

# Gráfico de Inercia Explicada
ggplot(FCM_eval) + 
  geom_raster(aes(x = m, y = k, fill = Explained.inertia)) + 
  geom_text(aes(x = m, y = k, label = round(Explained.inertia, 2)), size = 3) +
  scale_fill_viridis() +
  coord_fixed(ratio = 0.2) +
  labs(title = "Inercia Explicada")

# En el rango de M= 1.4 A 1.5 todavía mantienes una 
# inercia explicada alta (0.77 a 0.80), 
# lo que significa que el modelo captura 
# el 80% de la variabilidad de tus datos bióticos.

### MODELO FINAL (CMeans) ----
  # Una vez elegidos k y m de los gráficos anteriores, corres el modelo final:
FCM_result <- CMeans(dataset, k = 6, m = 1.5, standardize = TRUE,
                     seed = 123, tol = 0.001, init = "kpp")

# 7. VISUALIZACIÓN FINAL ----
par(mfrow=c(1,2))
plotRGB(gdm.pca_norm * 255, main="GDM-PCA (Australia)")
plot(FCM_result$rasters$Groups, main="Zonificación Biótica")
