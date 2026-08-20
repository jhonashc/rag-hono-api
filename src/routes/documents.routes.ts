import { Hono } from 'hono';

import { DocumentsService } from '@/services/documents.service';

const documentsRouter = new Hono();

const documentsService = new DocumentsService();

documentsRouter.post('/upload/single', async (c) => {
  // 1. Extraer los datos multipart/form-data de la petición
  const body = await c.req.parseBody();

  const file = body.file;

  // 2. Validar que se haya enviado un archivo y que sea de tipo File
  if (!file || !(file instanceof File)) {
    return c.json(
      { error: 'No se ha proporcionado ningún archivo válido' },
      400,
    );
  }

  // 3. Validar el tipo MIME (opcional pero recomendado)
  if (file.type !== 'application/pdf') {
    return c.json({ error: 'El archivo enviado debe ser un PDF' }, 400);
  }

  return c.json({
    status: true,
  });
});

export default documentsRouter;
