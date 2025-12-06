# Download Counter - Cloudflare Worker

API simples para contabilizar downloads dos projetos.

## Setup

### 1. Criar KV Namespace

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **Workers & Pages** > **KV**
3. Clique em **Create a namespace**
4. Nome: `DOWNLOADS`
5. Copie o **Namespace ID**

### 2. Atualizar wrangler.toml

Edite `wrangler.toml` e substitua `SEU_KV_NAMESPACE_ID_AQUI` pelo ID copiado.

### 3. Deploy via Dashboard (mais fácil)

1. Vá em **Workers & Pages** > **Create**
2. Selecione **Create Worker**
3. Dê o nome: `download-counter`
4. Clique em **Deploy**
5. Clique em **Edit code**
6. Cole o conteúdo de `download-counter.js`
7. Clique em **Deploy**
8. Vá em **Settings** > **Bindings** > **Add**
9. Selecione **KV Namespace**
10. Variable name: `DOWNLOADS`
11. KV namespace: selecione o que você criou
12. Clique em **Deploy**

### 4. Deploy via CLI (opcional)

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

## Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/count/{projectId}` | Retorna contador atual |
| POST | `/count/{projectId}/up` | Incrementa contador |
| GET | `/counts` | Retorna todos os contadores |

## Exemplo de Uso

```javascript
// Obter contador
const response = await fetch('https://download-counter.SEU_SUBDOMAIN.workers.dev/count/qrcode');
const data = await response.json();
console.log(data.count); // 42

// Incrementar
await fetch('https://download-counter.SEU_SUBDOMAIN.workers.dev/count/qrcode/up', { method: 'POST' });
```

## URL do Worker

Após o deploy, sua URL será algo como:
```
https://download-counter.SEUSUSERNAME.workers.dev
```

**Me envie essa URL** para eu atualizar o código do site!
