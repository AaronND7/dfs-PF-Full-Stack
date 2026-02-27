-- 1. Crear la base de datos
CREATE DATABASE escuela_musica;

-- Conéctate a la base antes de ejecutar lo demás:
-- \c escuela_musica

-- 2. Extensión necesaria para restricciones avanzadas
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 3. Tabla de usuarios (login y roles)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin','profesor','alumno')) NOT NULL
);

-- 4. Profesores
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100)
);

-- 5. Alumnos
CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INT
);

-- 6. Clases o cursos
CREATE TABLE clases (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- 7. Horarios (relación entre clase, profesor y alumno)
CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    clase_id INT REFERENCES clases(id) ON DELETE CASCADE,
    profesor_id INT REFERENCES profesores(id) ON DELETE CASCADE,
    alumno_id INT REFERENCES alumnos(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    CONSTRAINT chk_horario CHECK (hora_inicio < hora_fin)
);

-- 8. Restricciones para evitar solapamientos de horarios
-- Profesor no puede tener dos clases que se crucen en el mismo día
ALTER TABLE horarios
ADD CONSTRAINT no_conflicto_profesor
EXCLUDE USING gist (
    profesor_id WITH =,
    dia_semana WITH =,
    tstzrange(hora_inicio::timestamp, hora_fin::timestamp) WITH &&
);

-- Alumno no puede tener dos clases que se crucen en el mismo día
ALTER TABLE horarios
ADD CONSTRAINT no_conflicto_alumno
EXCLUDE USING gist (
    alumno_id WITH =,
    dia_semana WITH =,
    tstzrange(hora_inicio::timestamp, hora_fin::timestamp) WITH &&
);

-- 9. Datos de prueba
INSERT INTO usuarios (nombre, email, password, rol)
VALUES 
('Admin', 'admin@escuela.com', '1234', 'admin'),
('Carlos Pérez', 'carlos@escuela.com', '1234', 'profesor'),
('Ana López', 'ana@escuela.com', '1234', 'alumno');

INSERT INTO profesores (nombre, especialidad)
VALUES 
('Carlos Pérez', 'Piano'),
('María Gómez', 'Guitarra');

INSERT INTO alumnos (nombre, edad)
VALUES 
('Ana López', 15),
('Luis Torres', 18);

INSERT INTO clases (nombre, descripcion)
VALUES 
('Clase de Piano', 'Curso básico de piano'),
('Clase de Guitarra', 'Curso intermedio de guitarra');

-- Ejemplo de horarios válidos
INSERT INTO horarios (clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin)
VALUES 
(1, 1, 1, 'Lunes', '10:00', '11:00'),
(2, 2, 2, 'Martes', '12:00', '13:00');
