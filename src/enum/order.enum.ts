export enum OrderStatusEnum {
    PENDING = 'Pending',
    PLACED = 'Placed',
    ACCEPTED = 'Accepted',
    PROCESSING = 'Processing',
    DISPATCHED = 'Dispatched',
    DELIVERED = 'Delivered',
    FAILED = 'Failed',
    REJECT = 'Reject',
    RETURN = 'Return'
}
export enum OrderPaymentOptionEnum {
    COD = 'Cash on Delivery',
    ONLINE = 'Online'
}
export enum OrderHistoryOptionEnum {
    COMPLETED = 'Completed',
    PENDING = 'Pending'
}