# Z.AI GLM Coding Plan API Notes

## Key Information

### Endpoints

**General API** (not for Coding Plan):
```
https://api.z.ai/api/paas/v4
```

**Coding Plan API** (required for GLM Coding Plan subscription):
```
https://api.z.ai/api/coding/paas/v4
```

### Supported Models (Coding Plan)

- `glm-5.1` - Flagship model, best for complex tasks
- `glm-5-turbo` - Faster, good for most tasks
- `glm-4.7` - Standard model
- `glm-4.5-air` - Lightweight, fastest

### Authentication

```bash
Authorization: Bearer YOUR_API_KEY
```

### Request Format (OpenAI-Compatible)

```bash
curl -X POST "https://api.z.ai/api/coding/paas/v4/chat/completions" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_API_KEY" \
-d '{
  "model": "glm-5.1",
  "messages": [
    {"role": "system", "content": "You are a helpful AI assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "stream": true
}'
```

### Important Notes

1. **Must use Coding Plan endpoint** for GLM Coding Plan subscription
2. **Only 4 models supported** in Coding Plan (listed above)
3. **OpenAI-compatible API** - can use standard OpenAI SDKs
4. **Streaming supported** via `stream: true` parameter
5. **Rate limits** apply per subscription tier

### Pricing & Limits

- GLM Coding Plan: $10/month base, higher tiers available
- Tens of model calls per prompt allowed (varies by model)
- Quota only for coding/IDE tools, not general API usage

### Documentation References

- Official Docs: https://docs.z.ai/api-reference/introduction
- Coding Plan FAQ: https://docs.z.ai/devpack/faq
- Other Tools Integration: https://docs.z.ai/devpack/tool/others
