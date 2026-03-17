const BOLNA_API_BASE = "https://api.bolna.dev/v2";

interface BolnaCallPayload {
  agent_id: string;
  recipient_phone_number: string;
  user_data?: Record<string, string>;
}

interface BolnaCallResponse {
  execution_id?: string;
  status?: string;
  message?: string;
}

export async function triggerBolnaCall(
  apiKey: string,
  agentId: string,
  phone: string,
  userData?: Record<string, string>
): Promise<BolnaCallResponse> {
  const payload: BolnaCallPayload = {
    agent_id: agentId,
    recipient_phone_number: phone,
    user_data: userData,
  };

  const res = await fetch(`${BOLNA_API_BASE}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Bolna API error (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function getBolnaCallDetails(
  apiKey: string,
  executionId: string
) {
  const res = await fetch(`${BOLNA_API_BASE}/call/${executionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`Bolna API error (${res.status})`);
  }

  return res.json();
}

export async function triggerBatchCalls(
  apiKey: string,
  agentId: string,
  csvBlob: Blob,
  webhookUrl: string
) {
  const formData = new FormData();
  formData.append("file", csvBlob);
  formData.append("agent_id", agentId);
  formData.append("webhook_url", webhookUrl);

  const res = await fetch(`${BOLNA_API_BASE}/batches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Bolna Batch API error (${res.status}): ${errorText}`);
  }

  return res.json();
}
