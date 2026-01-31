-- =============================================
-- Seed Data: Categorías y Cursos predeterminados
-- =============================================

-- Categorías de Cursos
INSERT INTO course_categories (name, slug, description, sort_order) VALUES
  ('Discipulados', 'discipulados', 'Cursos de discipulado para crecer en tu fe y conocimiento de la Palabra de Dios.', 1),
  ('Liderazgo', 'liderazgo', 'Formación en liderazgo cristiano para servir en la iglesia y la comunidad.', 2),
  ('Otros Cursos', 'otros-cursos', 'Cursos especializados para diferentes áreas de la vida cristiana.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Cursos dentro de Discipulados
INSERT INTO courses (category_id, title, slug, description, is_published, sort_order, created_by)
SELECT
  cc.id,
  c.title,
  c.slug,
  c.description,
  true,
  c.sort_order,
  (SELECT id FROM auth.users LIMIT 1)
FROM course_categories cc
CROSS JOIN (VALUES
  ('Discipulado 1', 'discipulado-1', 'Primer nivel de discipulado. Fundamentos de la fe cristiana, la salvación y la vida en Cristo.', 1),
  ('Discipulado 2', 'discipulado-2', 'Segundo nivel de discipulado. Profundización en la doctrina, la oración y el servicio.', 2)
) AS c(title, slug, description, sort_order)
WHERE cc.slug = 'discipulados'
ON CONFLICT (slug) DO NOTHING;

-- Cursos dentro de Liderazgo
INSERT INTO courses (category_id, title, slug, description, is_published, sort_order, created_by)
SELECT
  cc.id,
  c.title,
  c.slug,
  c.description,
  true,
  c.sort_order,
  (SELECT id FROM auth.users LIMIT 1)
FROM course_categories cc
CROSS JOIN (VALUES
  ('Liderazgo Nivel 1', 'liderazgo-nivel-1', 'Introducción al liderazgo cristiano. Principios bíblicos para liderar con integridad.', 1),
  ('Liderazgo Nivel 2', 'liderazgo-nivel-2', 'Liderazgo intermedio. Gestión de equipos, mentoría y crecimiento ministerial.', 2),
  ('Liderazgo Nivel 3', 'liderazgo-nivel-3', 'Liderazgo avanzado. Visión estratégica, formación de líderes y gobierno eclesiástico.', 3)
) AS c(title, slug, description, sort_order)
WHERE cc.slug = 'liderazgo'
ON CONFLICT (slug) DO NOTHING;

-- Cursos dentro de Otros Cursos
INSERT INTO courses (category_id, title, slug, description, is_published, sort_order, created_by)
SELECT
  cc.id,
  c.title,
  c.slug,
  c.description,
  true,
  c.sort_order,
  (SELECT id FROM auth.users LIMIT 1)
FROM course_categories cc
CROSS JOIN (VALUES
  ('Curso Matrimonial', 'curso-matrimonial', 'Fortalece tu matrimonio con principios bíblicos. Comunicación, amor y propósito en la relación conyugal.', 1)
) AS c(title, slug, description, sort_order)
WHERE cc.slug = 'otros-cursos'
ON CONFLICT (slug) DO NOTHING;

-- Categorías de Prédicas
INSERT INTO sermon_categories (name, slug, description, sort_order) VALUES
  ('Prédicas Dominicales', 'predicas-dominicales', 'Mensajes de los servicios dominicales de nuestra iglesia.', 1),
  ('Devocionales Diarios', 'devocionales-diarios', 'Reflexiones diarias para alimentar tu vida espiritual.', 2)
ON CONFLICT (slug) DO NOTHING;
