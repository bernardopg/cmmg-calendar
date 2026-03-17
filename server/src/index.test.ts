import test from "node:test";
import assert from "node:assert/strict";
import { buildServer } from "./index.js";

function createMultipartBody(filename: string, content: string): {
  body: string;
  boundary: string;
} {
  const boundary = "----cmmg-boundary";
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    "Content-Type: application/json\r\n\r\n" +
    content +
    `\r\n--${boundary}--\r\n`;

  return { body, boundary };
}

test("GET /api/health returns status up", async (t) => {
  const app = await buildServer();
  t.after(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: "/api/health",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, "up");
});

test("POST /api/analyze accepts multipart json", async (t) => {
  const app = await buildServer();
  t.after(() => app.close());

  const payload = JSON.stringify({
    data: {
      SHorarioAluno: [
        {
          NOME: "Bioquímica",
          DATAINICIAL: "2026-04-10T00:00:00",
          HORAINICIAL: "14:00:00",
          HORAFINAL: "16:00:00",
          PREDIO: "Laboratório",
          DIASEMANA: "5",
        },
      ],
    },
  });
  const multipart = createMultipartBody("schedule.json", payload);

  const response = await app.inject({
    method: "POST",
    url: "/api/analyze",
    headers: {
      "content-type": `multipart/form-data; boundary=${multipart.boundary}`,
    },
    payload: multipart.body,
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().success, true);
  assert.equal(response.json().data.statistics.valid_entries, 1);
});
