{{/*
Expand the name of the chart.
*/}}
{{- define "workout-timer.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Full name: release + chart name, capped at 63 chars.
*/}}
{{- define "workout-timer.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "workout-timer.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "workout-timer.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "workout-timer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "workout-timer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "workout-timer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}