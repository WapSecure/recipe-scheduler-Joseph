export interface Event {
    id: string;
    userId?: string;
    title: string;
    eventTime: string;
    createdAt: string;
  }
  
  export interface Device {
    userId: string;
    pushToken: string;
  }