import {
	TASKS_CREATED,
	RENEW_TASKS,
	UPDATE_TASKS
} from './actions';


function tasksCreated(state = {'active': [], 'finished': []}, action) {
	const message = action.message;

	return {
		'active': state['active'].concat(message['new_tasks']),
		'finished': state['finished']
	}
}


function renewTasks(state = {'active': [], 'finished': []}, action) {
	return action.tasks;
}

function update_tasks(state = {'active': [], 'finished': []}, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		const active_tasks = message['tasks']['active'].filter((x) => {
			return x.project_uuid == action.current_project_uuid;
		});

		var updated_active_task_ids = [];

		var parsed_active_tasks = _.map(active_tasks, (x) => {
			updated_active_task_ids.push(x["task_id"]);

			return {
				"task_id": x["task_id"],
				"task_type": x["task_type"],
				"params": x["params"],
				"target": x["target"],
				"status": x["status"],
				"progress": x["progress"],
				"project_uuid": x["project_uuid"],
				"text": x["text"],
				"stdout": x["stdout"],
				"stderr": x["stderr"],
				"date_added": x["date_added"],
				"date_finished": x["date_finished"]
			}
		});

		const finished_tasks = message['tasks']['finished'].filter((x) => {
			return x.project_uuid == action.current_project_uuid;
		});
		var updated_finished_task_ids = [];

		var parsed_finished_tasks = _.map(finished_tasks, (x) => {
			updated_finished_task_ids.push(x["task_id"]);

			return {
				"task_id": x["task_id"],
				"task_type": x["task_type"],
				"params": x["params"],
				"target": x["target"],
				"status": x["status"],
				"progress": x["progress"],
				"project_uuid": x["project_uuid"],
				"text": x["text"],
				"stdout": x["stdout"],
				"stderr": x["stderr"],
				"date_added": x["date_added"],
				"date_finished": x["date_finished"]
			}
		});

		var filtered_active_tasks = state.active.filter((x) => {
			return ((updated_active_task_ids.indexOf(x.task_id) === -1) && 
				(updated_finished_task_ids.indexOf(x.task_id) === -1));
		});

		return { 
			'active': parsed_active_tasks.concat(filtered_active_tasks),
			'finished': parsed_finished_tasks.concat(state.finished)
		};
	} else {
		/* TODO: add error handling */
	}	
}

function task_reduce(state = {'active': [], 'finished': []}, action) {
	if (action.message && action.message.project_uuid && action.message.project_uuid != action.current_project_uuid ) { return state; }
	else {
		switch (action.type) {
			case TASKS_CREATED:
				return tasksCreated(state, action);
			case RENEW_TASKS:
				return renewTasks(state, action);
			case UPDATE_TASKS:
				return update_tasks(state, action);
			default:
				return state;
		}
	}
}

export default task_reduce
