export function DownlinkQueuedResponseModel(response) {
  const {
    end_device_ids,
    correlation_ids,
    downlink_queued
  } = response;

  const {
    device_id,
    application_ids
  } = end_device_ids;

  const {
    application_id
  } = application_ids;

  const {
    f_port,
    frm_payload,
    correlation_ids: downlink_correlation_ids
  } = downlink_queued;

  const model = {
    deviceId: device_id,
    applicationId: application_id,
    correlationIds: correlation_ids,
    downlinkQueued: {
      fPort: f_port,
      frmPayload: frm_payload,
      correlationIds: downlink_correlation_ids
    }
  };

  return model;
}
