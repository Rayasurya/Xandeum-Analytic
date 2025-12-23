import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import IconExchange from "@/assets/icons/IconExchange";
import Button from "@/components/Button/Button";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import ManageConnect from "@/components/ManageConnect/ManageConnect";
import {TMLBackend} from "@/models/mlBackend";
import Modal from "@/components/Modal/Modal";
import {Edge, Handle, Node, Position, ReactFlow, ReactFlowInstance} from "@xyflow/react";

export type TNodeMLProps = {
  proxyUrl: string
  masterNodes: TMLBackend[];
  workerNodes: TMLBackend[];
  hasMaster: boolean;
  refreshMlList: () => void;
  onDeletedMl: () => void;
  openDashboard: (backend: TMLBackend) => void;
  resetContainer: () => void;
  centrifugeToken: string,
  projectID: number;
  netWorkId: number | undefined;
  isLoadingNode: boolean;
}

export type THandleSide = "top" | "left" | "bottom" | "right";

const WORKER_SIDES: Record<THandleSide, THandleSide> = {
  "top": "bottom",
  "bottom": "top",
  "left": "right",
  "right": "left",
}

const HANDLE_SIDE_TYPE: Record<THandleSide, Position> = {
  "top": Position.Top,
  "bottom": Position.Bottom,
  "left": Position.Left,
  "right": Position.Right,
}

export function MasterNode({data}: {data: {label: string}}) {
  return (
    <div style={{
      padding: "8px 16px",
      border: "solid 1px rgba(0,0,0,.3)",
      borderRadius: 8,
      width: 100,
      height: 24,
      textAlign: "center",
    }}>
      <Handle type="target" position={Position.Left} id="left" isConnectable={true} />
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="right" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="bottom" isConnectable={true} />
      {data.label}
    </div>
  );
}

export function WorkerNode({data}: {data: {label: string, masterSide: THandleSide, connected: boolean}}) {
  const handleSide = WORKER_SIDES[data.masterSide];

  return (
    <div style={{
      padding: "8px 16px",
      border: "solid 1px rgba(0,0,0,.3)",
      borderRadius: 8,
      width: 100,
      height: 24,
      textAlign: "center",
      backgroundColor: data.connected ? "#27BE69" : "#F2415A",
      color: "#FFFFFF",
    }}>
      <Handle type="source" position={HANDLE_SIDE_TYPE[handleSide]} id={handleSide} isConnectable={true} />
      {data.label}
    </div>
  );
}

const NodeML = (props: TNodeMLProps) => {
  const {
    proxyUrl,
    masterNodes,
    workerNodes,
    hasMaster,
    refreshMlList,
    openDashboard,
    resetContainer,
    onDeletedMl,
    centrifugeToken,
    projectID,
    netWorkId,
    isLoadingNode,
  } = props;

  const [monitor, setMonitor] = useState<boolean>(false);
  const reactFlowRef = useRef<ReactFlowInstance>();

  useEffect(() => {
    function autoFit() {
      if (!reactFlowRef.current) {
        return;
      }

      reactFlowRef.current.fitView();
    }

    window.addEventListener("resize", autoFit);

    return () => {
      window.removeEventListener("resize", autoFit);
    }
  }, []);

  const mlJoined = useMemo(() => {
    return workerNodes.filter(item => item.network_history?.status === "joined");
  }, [workerNodes]);

  const mlDisconnected = useMemo(() => {
    return workerNodes.filter(item => item.network_history?.status !== "joined");
  }, [workerNodes]);

  const getMasterSide = useCallback((a: number): THandleSide => {
    return a >= 45 && a < 135 ? "top" : (a >= 135 && a < 225 ? "left" : (a >= 225 && a < 315 ? "bottom" : "right"));
  }, []);

  const nodes = useMemo(() => {
    const list: Node[] = [];

    if (masterNodes.length > 0) {
      list.push({
        id: "master",
        data: {label: "Master #" + masterNodes[0].id},
        position: {x: -50, y: 20},
        draggable: false,
        connectable: false,
        type: "master",
      });
    }

    const angle = 360 / workerNodes.length;

    workerNodes.forEach((node, idx) => {
      const a = Math.PI * 2 * angle * idx / 360;
      const aDeg = angle * idx;
      const x = 400 * Math.cos(a) - 50;
      const y = -300 * Math.sin(a) + 20;

      list.push({
        id: node.id.toString(),
        data: {
          label: "Worker #" + node.id,
          masterSide: getMasterSide(aDeg),
          connected: node.network_history?.status === "joined",
        },
        position: {x, y},
        draggable: false,
        connectable: false,
        type: "worker",
      });
    });

    return list;
  }, [getMasterSide, masterNodes, workerNodes]);

  const edges = useMemo(() => {
    const list: Edge[] = [];
    const angle = 360 / workerNodes.length;

    workerNodes.forEach((node, idx) => {
      if (node.network_history?.status !== "joined") {
        return;
      }

      const a = angle * idx;
      const masterSide = getMasterSide(a);

      list.push({
        id: "e-" + node.id,
        source: node.id.toString(),
        sourceHandle: WORKER_SIDES[masterSide],
        target: "master",
        targetHandle: masterSide,
        reconnectable: false,
        animated: true,
      });
    });

    return list;
  }, [getMasterSide, workerNodes]);

  const nodeTypes = useMemo(() => ({
    master: MasterNode,
    worker: WorkerNode,
  }), []);

  return (
    <>
      {
        isLoadingNode
          ?
          <div className="joined">
            <EmptyContent message="Loading ML nodes" />
          </div>
          :
          <>
            <div className="joined">
              {(masterNodes.length > 0 || mlJoined.length > 0) &&
                <span className="c-ml__last-text">
                  End Point: {proxyUrl ? <span className="endpoint">{proxyUrl}</span> : "No Proxy URL available"}
                  <Button size="tiny" type="warning" className="reset" onClick={resetContainer}>
                    Reset
                  </Button>
                  {masterNodes.length > 0 && (
                    <Button size="tiny" type="gradient" className="reset" onClick={() => setMonitor(true)}>
                      Monitor
                    </Button>
                  )}
                </span>
              }
              {masterNodes.length > 0 && (
                <div className="c-ml__master-nodes">
                  {masterNodes.map((item) => (
                    <ManageConnect
                      key={`key-${item.id}`}
                      data={item}
                      refresh={refreshMlList}
                      onDeleted={onDeletedMl}
                      hasMaster={hasMaster}
                      openDashboard={openDashboard}
                      isMasterNode={true}
                      centrifugeToken={centrifugeToken}
                      isNetWorkDisconnected={item?.network_history?.status !== "joined"}
                    />
                  ))}
                </div>
              )}
              {mlJoined.length > 0 && (
                <div className="c-ml__last-content">
                  {mlJoined.filter(item => item.network_history?.status === "joined").map((item) => (
                    <ManageConnect
                      key={`key-${item.id}`}
                      data={item}
                      refresh={refreshMlList}
                      onDeleted={onDeletedMl}
                      hasMaster={hasMaster}
                      openDashboard={openDashboard}
                      isMasterNode={false}
                      centrifugeToken={centrifugeToken}
                      isNetWorkDisconnected={item?.network_history?.status !== "joined"}
                      projectID={projectID}
                      netWorkId={netWorkId}
                    />
                  ))}
                </div>
              )}
            </div>
            {mlDisconnected.length > 0 &&
              <div className="disconnected">
                <IconExchange />
                <div className="c-ml__last-content">
                  {mlDisconnected.map((item) => (
                    <ManageConnect
                      key={`key-${item.id}`}
                      data={item}
                      refresh={refreshMlList}
                      onDeleted={onDeletedMl}
                      hasMaster={hasMaster}
                      openDashboard={openDashboard}
                      isMasterNode={false}
                      centrifugeToken={centrifugeToken}
                      isNetWorkDisconnected={item?.network_history?.status !== "joined"}
                      projectID={projectID}
                      netWorkId={netWorkId}
                      proxyUrl={item.url}
                    />
                  ))}
                </div>
              </div>
            }
          </>
      }
      <Modal open={monitor} onClose={() => setMonitor(false)}>
        <div style={{width: "90vw", height: "80vh"}}>
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            fitView={true}
            fitViewOptions={{
              padding: 0,
              nodes,
            }}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            zoomOnPinch={false}
            panOnDrag={false}
            debug={window.APP_SETTINGS.debug}
            onInit={ins => reactFlowRef.current = ins}
          />
        </div>
      </Modal>
    </>
  )
}

export default NodeML;
