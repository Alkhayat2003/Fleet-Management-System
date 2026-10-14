from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/location/(?P<vehicle_id>\d+)/$', consumers.VehicleLocationConsumer.as_asgi()),
    re_path(r'ws/all-vehicles/$', consumers.AllVehiclesLocationConsumer.as_asgi()),
]