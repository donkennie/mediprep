import { Record } from "../../../../domain/queue/producer";
import { QueueRepository } from "../../../../domain/queue/repository";
import { Kafka, Producer, ProducerRecord } from "kafkajs";

// export class QueueRepositoryKafka implements QueueRepository {
//     producer: Producer;
//     constructor(kafka: Kafka) {
//         this.producer = kafka.producer();
//     }
//     Produce = async (record: Record) => {
//         const kafkaProducerRecord: ProducerRecord = {
//             topic: record.queue,
//             messages: [
//                 {
//                     value: record.message,
//                 },
//             ],
//         };

//         try {
//             await this.producer.connect();
//             await this.producer.send(kafkaProducerRecord);
//         } catch (error) {
//             throw error;
//         }
//     };
// }
export class QueueRepositoryKafka implements QueueRepository {
    private producer: Producer;
    private isConnected: boolean = false;
    
    constructor(kafka: Kafka) {
        this.producer = kafka.producer({
            // Add retry configuration
            retry: {
                initialRetryTime: 100,
                retries: 8,
                maxRetryTime: 30000
            }
        });
        this.connect(); // Connect on initialization
    }
    
    private async connect() {
        if (!this.isConnected) {
            try {
                await this.producer.connect();
                this.isConnected = true;
                console.log("Successfully connected to Kafka");
            } catch (error) {
                console.error("Failed to connect to Kafka:", error);
                this.isConnected = false;
                // Don't throw - just log the error
            }
        }
    }
    
    Produce = async (record: Record) => {
        const kafkaProducerRecord: ProducerRecord = {
            topic: record.queue,
            messages: [
                {
                    value: record.message,
                },
            ],
        };

        try {
            // Ensure connection is established
            if (!this.isConnected) {
                await this.connect();
            }
            
            // Send message if connected
            if (this.isConnected) {
                await this.producer.send(kafkaProducerRecord);
            } else {
                console.error("Cannot send message - not connected to Kafka");
            }
        } catch (error) {
            console.error("Error sending message to Kafka:", error);
            this.isConnected = false; // Reset connection state on error
            // Handle the error gracefully rather than throwing
        }
    };
    
    // Add a disconnect method to be called during application shutdown
    disconnect = async () => {
        if (this.isConnected) {
            try {
                await this.producer.disconnect();
                this.isConnected = false;
                console.log("Disconnected from Kafka");
            } catch (error) {
                console.error("Error disconnecting from Kafka:", error);
            }
        }
    };
}
