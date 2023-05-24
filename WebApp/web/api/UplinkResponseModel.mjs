export function UplinkResponseModel(response) {
    const {
        end_device_ids,
        correlation_ids,
        received_at,
        uplink_message,
        simulated
    } = response;

    const {
        device_id,
        application_ids,
        dev_eui,
        dev_addr
    } = end_device_ids;

    const {
        application_id
    } = application_ids;

    const {
        f_port,
        frm_payload,
        rx_metadata,
        settings,
        locations
    } = uplink_message;

    const {
        latitude,
        longitude,
        source
    } = locations.user;

    const model = {
        deviceId: device_id,
        applicationId: application_id,
        devEui: dev_eui,
        devAddr: dev_addr,
        correlationIds: correlation_ids,
        receivedAt: received_at,
        uplink: {
            fPort: f_port,
            frmPayload: frm_payload,
            rxMetadata: rx_metadata,
            settings,
            locations: {
                latitude,
                longitude,
                source
            }
        },
        simulated
    };

    return model;
}
