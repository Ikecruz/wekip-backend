import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk"
import { EXPO_ACCESS_TOKEN } from "../config"
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import database from "../database";

export default class NotificationService {

    private expo = new Expo({ accessToken: EXPO_ACCESS_TOKEN })

    private dbService: PrismaClient = database.getClient()

    public checkPushToken(pushToken: string) {
        return Expo.isExpoPushToken(pushToken)
    }

    public async sendNotification(pushTokens: string[], title: string, body: string) {
        let messages: ExpoPushMessage[] = []
        for(let pushToken of pushTokens) {
            if(!Expo.isExpoPushToken(pushToken)) {
                logger.error(`[PUSH NOTIFICATION ERROR]: Push token ${pushToken} is not a valid Expo push token`)
            }
            else {
                messages.push({
                    to: pushToken,
                    sound: "default",
                    title,
                    body
                })
            }
        }
        const chunks = this.expo.chunkPushNotifications(messages)
        let tickets: ExpoPushTicket[] = []
        for(let chunk of chunks) {
            try {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk)
                tickets.push(...ticketChunk)
            } catch (error) {
                logger.error(`[PUSH NOTIFICATION ERROR]: ${JSON.stringify(error)}`)
            }
        }
        const timeOut = 15 * 60 * 1000
        setTimeout(() => {
            this.handleReceipts(tickets, messages)
        }, timeOut)
    }

    private async handleReceipts(tickets: ExpoPushTicket[], messages: ExpoPushMessage[]) {
        let receiptIds: string[] = []
        for(let ticket of tickets) {
            if(ticket.status == "ok") {
                receiptIds.push(ticket.id)
            }
        }
        const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds)
        for (let chunk of receiptIdChunks) {
            try {
                let receipts = await this.expo.getPushNotificationReceiptsAsync(chunk)
                for(let receiptId in receipts) {
                    const receipt = receipts[receiptId]
                    if(receipt.status == "ok") continue
                    else if(receipt.status == "error") {
                        logger.error(`[PUSH NOTIFICATION ERROR]: ${receipt.message}`)
                        if(receipt.details && receipt.details.error) {
                            logger.error(`[PUSH NOTIFICATION ERROR]: ${receipt.details.error}`)
                            if(receipt.details.error == "DeviceNotRegistered") {
                                /** Handle this error by deactivating this particular pushToken for the user(s)
                                 * This implementation may be subject to change after testing/tinkering
                                */
                                const ticket = tickets.find(ticket => ticket.status === 'ok' && ticket.id === receiptId)
                                const index = tickets.indexOf(ticket!)
                                const problematicMessage = messages[index]
                                await this.dbService.user.updateMany({
                                    where: {
                                        push_token: problematicMessage.to as string
                                    },
                                    data: {
                                        push_token: null
                                    }
                                })
                            }
                        }
                    }
                }
            } catch (error) {
                logger.error(`[PUSH NOTIFICATION ERROR]: ${JSON.stringify(error)}`)
            }
        }
    }

}