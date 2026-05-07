-- =====================================================
-- DATOS INICIALES PARA PAPELERIA APP
-- =====================================================

INSERT INTO rol_usuario (nombre, nivel_prioridad) VALUES 
('admin', 3), 
('vendedor', 2), 
('bodega', 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    nivel_prioridad = VALUES(nivel_prioridad);

INSERT INTO estado_usuario (nombre) VALUES 
('activo'), 
('inactivo')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO estado_documento (nombre) VALUES 
('registrada'), 
('anulada')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO metodo_pago (nombre) VALUES 
('efectivo'), 
('transferencia'), 
('tarjeta'), 
('mixto')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tipo_movimiento (nombre) VALUES 
('entrada'), 
('salida'), 
('ajuste_entrada'), 
('ajuste_salida')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO origen_movimiento (nombre) VALUES 
('compra'), 
('venta'), 
('ajuste_manual'), 
('devolucion_compra'), 
('devolucion_venta')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Hash para contrasena "admin123"
INSERT INTO usuario (
    nombre_usuario, 
    contrasena_hash, 
    id_rol, 
    nombre_completo, 
    id_estado_usuario, 
    fecha_creacion,
    intentos_fallidos,
    cuenta_bloqueada,
    email,
    email_verificado
)
SELECT 
    'admin',
    '$2a$10$dXJ3sa6X7cJ9pG0Y5qQqQeO5qQqQeO5qQqQeO5qQqQeO5qQqQeO5qQqQ',
    (SELECT id_rol FROM rol_usuario WHERE nombre = 'admin'),
    'Administrador Principal',
    (SELECT id_estado_usuario FROM estado_usuario WHERE nombre = 'activo'),
    NOW(),
    0,
    0,
    'admin@papeleria.com',
    1
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = 'admin');

-- Hash para contrasena "vendedor123"
INSERT INTO usuario (
    nombre_usuario, 
    contrasena_hash, 
    id_rol, 
    nombre_completo, 
    id_estado_usuario, 
    fecha_creacion,
    intentos_fallidos,
    cuenta_bloqueada,
    email,
    email_verificado
)
SELECT 
    'vendedor1',
    '$2a$10$eL5Q7S9U1W3Y5A7C9E1G3I5K7M9O1Q3S5U7W9Y1A3C5E7G9I1K3M',
    (SELECT id_rol FROM rol_usuario WHERE nombre = 'vendedor'),
    'Vendedor Principal',
    (SELECT id_estado_usuario FROM estado_usuario WHERE nombre = 'activo'),
    NOW(),
    0,
    0,
    'vendedor@papeleria.com',
    1
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = 'vendedor1');

-- Hash para contrasena "bodega123"
INSERT INTO usuario (
    nombre_usuario, 
    contrasena_hash, 
    id_rol, 
    nombre_completo, 
    id_estado_usuario, 
    fecha_creacion,
    intentos_fallidos,
    cuenta_bloqueada,
    email,
    email_verificado
)
SELECT 
    'bodega1',
    '$2a$10$g7I9K1M3O5Q7S9U1W3Y5A7C9E1G3I5K7M9O1Q3S5U7W9Y1A3C5E',
    (SELECT id_rol FROM rol_usuario WHERE nombre = 'bodega'),
    'Encargado de Bodega',
    (SELECT id_estado_usuario FROM estado_usuario WHERE nombre = 'activo'),
    NOW(),
    0,
    0,
    'bodega@papeleria.com',
    1
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = 'bodega1');

INSERT INTO cliente (nombre, fecha_creacion) 
VALUES ('Cliente Mostrador', NOW())
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO categoria (nombre, descripcion) VALUES
('Utiles Escolares', 'Cuadernos, lapices, colores y utiles en general'),
('Oficina', 'Articulos de oficina y papeleria empresarial'),
('Arte', 'Materiales para dibujo, pintura y manualidades')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_negocio', 'Mi Papeleria', 'Nombre del negocio'),
('nit_negocio', '', 'NIT o identificacion del negocio'),
('telefono', '3001234567', 'Telefono de contacto'),
('correo_negocio', 'contacto@mipapeleria.com', 'Correo del negocio'),
('direccion_negocio', '', 'Direccion del negocio'),
('impresora_default', 'ticket', 'Tipo de impresion por defecto'),
('iva_porcentaje', '19', 'Porcentaje de IVA'),
('iva_incluido', 'false', 'Indica si el precio ya incluye IVA')
ON DUPLICATE KEY UPDATE valor = VALUES(valor), descripcion = VALUES(descripcion);