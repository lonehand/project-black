import json
from sanic import response

from server.handlers.utils import authorized_class_method
from server.handlers.ips import IPsNotifier


class ScopesHandlers:
    def __init__(self, scope_manager, socketio):
        self.scope_manager = scope_manager
        self.ips_notifier = IPsNotifier(socketio)

    @authorized_class_method()
    async def cd_create_scopes(self, request, project_uuid):
        project_uuid = int(project_uuid)
        scopes = json.loads(request.body)['scopes']

        results = {
            'hosts_added': False,
            'ips_added': False,
            'error': False,
            'error_message': None
        }

        for scope in scopes:
            target = scope['target']
            target_type = scope['type']

            if target_type == 'hostname':
                create_result = await self.scope_manager.create_host(
                    target, project_uuid
                )

                if create_result['status'] == 'success':
                    results['hosts_added'] = True
                elif create_result['status'] == 'error':
                    results['error'] = True
                    results['error_message'] = create_result['text']

            elif target_type == 'ip_address':
                create_result = await self.scope_manager.create_ip(
                    target, project_uuid
                )

                if create_result['status'] == 'success':
                    results['ips_added'] = True
                elif create_result['status'] == 'error':
                    results['error'] = True
                    results['error_message'] = create_result['text']

            elif target_type == 'network':
                create_result = await self.scope_manager.create_ips_network(
                    target, project_uuid
                )

                if create_result['status'] == 'success':
                    results['ips_added'] = True

                elif create_result['status'] == 'error':
                    results['error'] = True
                    results['error_message'] = create_result['text']

        if not results['error']:
            if results['ips_added']:
                await self.ips_notifier.notify_on_created_ip(project_uuid)
            if results['hosts_added']:
                # TODO: implement this when HostsNotifier is finished
                pass

            return response.json({ 'status': 'ok' })
        else:
            return response.json({ 'status': 'error', 'message': results['error_message'] })