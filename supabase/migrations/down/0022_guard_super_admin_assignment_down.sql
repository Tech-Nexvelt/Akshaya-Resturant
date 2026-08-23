-- Migration 0022 Down: Revert super_admin assignment restriction & RPC execute grants
GRANT EXECUTE ON FUNCTION record_payment_success TO authenticated;
GRANT EXECUTE ON FUNCTION record_webhook_event TO authenticated;
GRANT EXECUTE ON FUNCTION update_webhook_outcome TO authenticated;
