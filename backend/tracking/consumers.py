from channels.generic.websocket import AsyncWebsocketConsumer
import json

class VehicleLocationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.vehicle_id = self.scope['url_route']['kwargs']['vehicle_id']
        self.group_name = f'location_{self.vehicle_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        await self.send(text_data=f"Echo: {text_data}")

    async def location_update(self, event):
        location = event['location']
        await self.send(text_data=json.dumps(location))


class AllVehiclesLocationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_name = 'all_vehicles_locations'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # يمكن إرسال أوامر مثل تحديث فوري أو تصفية
        data = json.loads(text_data)
        if data.get('type') == 'request_update':
            # إرسال طلب تحديث فوري
            await self.channel_layer.group_send(
                'all_vehicles_locations',
                {
                    'type': 'request_immediate_update',
                    'message': 'update_requested'
                }
            )

    async def location_update(self, event):

        location_data = event['location']
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'data': location_data
        }))

    async def all_vehicles_update(self, event):

        vehicles_data = event['vehicles']
        await self.send(text_data=json.dumps({
            'type': 'all_vehicles_update',
            'data': vehicles_data
        }))

    async def notification(self, event):

        notification_data = event['notification']
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': notification_data
        }))